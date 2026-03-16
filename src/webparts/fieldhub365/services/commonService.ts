import { getTimeAgo } from "../config/utils";

export const getEmployeeDetails = async (
  setEmployeeDetails: (details: any) => void,
  spWeb: any,
  userEmail: string,
) => {
  try {
    const user = await spWeb.currentUser.get();
    const items = await spWeb.lists
      .getByTitle("EmployeeDetails")
      .select("*,Employee/Id,Employee/Title,Employee/EMail")
      .expand("Employee")
      .items.get();

    const tempEmployeeDetails = items.map((employee: any) => ({
      id: employee.Id,
      employee: employee.Employee,
      employeeId: employee.EmployeeId,
      skillSets: employee.SkillSets,
      role: employee.Role,
      level: employee.Level,
      address1: employee.Address1,
      address2: employee.Address2,
      address: `${employee.Address1}, ${employee.Address2}, ${employee.City}`,
      city: employee.City,
      contactNo: employee.ContactNo,
      contactEmail: employee.ContactEmail,
    }));

    const EmployeeWithDetails = tempEmployeeDetails.find(
      (emp: any) => emp.employeeId === user.Id,
    );

    setEmployeeDetails({
      ...EmployeeWithDetails,
      employee: user.Title,
      contactEmail: user.Email,
    });
  } catch (error) {
    console.error("Error fetching employee details:", error);
  }
};

// Fetch recent acctivities function

export const getActiveClockRecord = (userId: number, spWeb: any) => {
  try {
    const getActiveClockItem = spWeb.lists
      .getByTitle("ClockInOut")
      .select("*,Author/Id,Author/Title,Author/EMail")
      .expand("Author")
      .items.get()
      .then((res: any) => {
        const filtered = res.filter((item: any) => {
          const owner = item.AuthorId;
          const clockOut = item.ClockOut;
          return owner === userId && clockOut === false;
        });
        return filtered;
      });
    return getActiveClockItem;
  } catch (error) {
    console.log("Error :", error);
  }
};

export const clockIn = async (spWeb: any) => {
  try {
    await spWeb.lists.getByTitle("ClockInOut").items.add({
      StartTime: new Date().toISOString(),
      ClockOut: false,
    });
  } catch (error) {
    console.log("Error :", error);
  }
};

export const clockOut = async (spWeb: any, recId: number) => {
  try {
    await spWeb.lists.getByTitle("ClockInOut").items.getById(recId).update({
      EndTime: new Date().toISOString(),
      ClockOut: true,
    });
  } catch (error) {
    console.log("Error :", error);
  }
};

const getSignatureFile = async (spWeb: any, jobId: number) => {
  try {
    const folderPath = `/sites/FieldService/JobAttachments/J000${jobId}`;

    const files = await spWeb
      .getFolderByServerRelativePath(folderPath)
      .files.select("Name", "ServerRelativeUrl")();

    const signature = files.find((file: any) =>
      file.Name.includes("signature"),
    );

    return signature ? signature.ServerRelativeUrl : "";
  } catch (error) {
    console.log("Signature not found");
    return "";
  }
};

// Fetch all jobs function

export const getjobsDetails = async (
  spWeb: any,
  setAllJobs: any,
  userId: number,
  setIsLoader: any,
) => {
  try {
    setIsLoader(true);
    const customerDetails = await spWeb.lists
      .getByTitle("CustomerDetails")
      .items.get()
      .then((res: any) => {
        const tempCustomerDetails = res.map((customer: any) => {
          return {
            id: customer.Id,
            address1: customer.Address1,
            address2: customer.Address2,
            city: customer.City,
            contactNo: customer.ContactNo,
            contactEmail: customer.ContactEmail,
            firstName: customer.FirstName,
            lastName: customer.LastName,
          };
        });
        return tempCustomerDetails;
      });
    await spWeb.lists
      .getByTitle("Jobs")
      .select("*,Author/Id,Author/Title,Author/EMail,Customer/Id")
      .expand("Author,Customer")
      .items.get()
      .then(async (res: any) => {
        const tempJobDetails = await Promise.all(
          res
            .filter((job: any) => job.AssingToId === userId)
            .map(async (job: any) => {
              const customer = customerDetails.find(
                (customer: any) => customer?.id === job.CustomerId,
              );

              const signatureUrl =
                job.Status === "Completed"
                  ? await getSignatureFile(spWeb, job.Id)
                  : "";

              return {
                id: job.Id,
                title: job.Title,
                description: job.Descriptions,
                status: job.Status,
                priority: job.Priority,
                startDate: job.StartDate,
                endDate: job.EndDate,
                customerRating: job.Rating,
                customerFeedback: job.FeedBacks,
                timeSlot: job.Timeslot,
                preferedDate: job.PreferedDate,

                customerId: customer.id,
                firstName: customer.firstName,
                lastName: customer.lastName,
                customer: customer.firstName,
                address1: customer.address1,
                address2: customer.address2,
                address: customer.address1,
                city: customer.city,
                contactNo: customer.contactNo,
                contactEmail: customer.contactEmail,

                signatureUrl: signatureUrl,
              };
            }),
        );
        console.log("tempJobDetails", tempJobDetails);

        setAllJobs(tempJobDetails.reverse());

        setInterval(() => {
          setIsLoader(false);
        }, 1000);
      });
  } catch (error) {
    console.log("Error :", error);
  }
};

// Fetch recent acctivies functions

export const getAllActivities = async (
  spWeb: any,
  setRecentActivities: any,
  setIsLoader?: any,
) => {
  try {
    setIsLoader && setIsLoader(true);
    await spWeb.lists
      .getByTitle("Activities")
      .select("*,Job/Id")
      .expand("Job")
      .items.get()
      .then((res: any) => {
        const tempJobDetails = res.map((activity: any) => {
          return {
            id: activity.id,
            title: activity.Title,
            description: activity.Description,
            job: activity.JobId,
            created: activity.Created,
          };
        });
        setRecentActivities(tempJobDetails.reverse());
        setInterval(() => {
          setIsLoader && setIsLoader(false);
        }, 1000);
      });
  } catch (error) {
    console.log("Error :", error);
  }
};

// Fetch notifications

export const getNotifications = async (
  spWeb: any,
  setNotifications: any,
  userEmail: string,
  setIsLoader: any,
) => {
  try {
    setIsLoader(true);
    await spWeb.lists
      .getByTitle("Notifications")
      .items.get()
      .then((res: any) => {
        const tempNotifications = res.map((notification: any) => {
          return {
            id: notification.Id,
            title: notification.Title,
            message: notification.Descriptions,
            time: getTimeAgo(notification.Created),
            type: "success",
            isRead: notification.MarkAsRead ? true : false,
          };
        });
        setNotifications(tempNotifications.reverse());
        setInterval(() => {
          setIsLoader(false);
        }, 1000);
      });
  } catch (error) {
    console.log("Error :", error);
  }
};
