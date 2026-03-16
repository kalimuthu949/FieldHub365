export const getBannerActivities = async (
  spWeb: any,
  setBannerActivities: any,
  setOnGoingJob: any,
  userId: number,
) => {
  try {
    const res: any[] = await spWeb.lists
      .getByTitle("Jobs")
      .select(
        "Id",
        "Title",
        "Priority",
        "Status",
        "Created",
        "Modified",
        "PreferedDate",
        "AssingToId",
        "Author/Id",
        "Author/Title",
        "Author/EMail",
        "Customer/Id",
      )
      .expand("Author,Customer")
      .items.get();

    const today = new Date().toDateString();

    const myJobs = res.filter(
      (job) =>
        job.AssingToId === userId &&
        job.PreferedDate &&
        new Date(job.PreferedDate).toDateString() === today,
    );

    const inProgressToday = myJobs.filter(
      (job) => job.Status === "In Progress",
    );
    setOnGoingJob(inProgressToday.length !== 0 ? inProgressToday[0] : {});

    // const todayJobs = myJobs.filter(
    //   (job) =>
    //     job.PreferedDate && new Date(job.PreferedDate).toDateString() === today,
    // );

    const highPriorityJobs = myJobs.filter((job) => job.Priority === "High");

    const completedToday = myJobs.filter((job) => job.Status === "Completed");

    const pendingJobs = myJobs.filter((job) => job.Status !== "Completed");

    const bannerTexts: string[] = [];

    /* JOB ASSIGNMENT */
    if (myJobs.length > 0) {
      bannerTexts.push(`You have ${myJobs.length} jobs scheduled for today`);
    }

    /* PRIORITY ALERTS */
    if (highPriorityJobs.length > 0) {
      bannerTexts.push(
        `${highPriorityJobs.length} high priority jobs need your attention`,
      );
    }

    /* COMPLETION */
    if (completedToday.length > 0) {
      bannerTexts.push(
        `Great work! You completed ${completedToday.length} jobs today`,
      );
    }

    /* PENDING */
    if (pendingJobs.length > 0) {
      bannerTexts.push(
        `You still have ${pendingJobs.length} pending jobs to finish`,
      );
    }

    /* PRODUCTIVITY MESSAGE */
    if (completedToday.length >= 5) {
      bannerTexts.push(
        `Excellent productivity! ${completedToday.length} jobs completed today`,
      );
    }

    /* MOTIVATION MESSAGE */
    if (myJobs.length === 0 && pendingJobs.length === 0) {
      bannerTexts.push(`No jobs scheduled right now. Enjoy your free time!`);
    }

    /* LIMIT BANNERS FOR UI */
    setBannerActivities(bannerTexts.slice(0, 6));
  } catch (error) {
    console.log("Error :", error);
  }
};
export const getUserActivities = async (
  spWeb: any,
  setUserActivities: any,
  userId: number,
  setIsLoader: any,
) => {
  try {
    setIsLoader(true);
    const res: any[] = await spWeb.lists
      .getByTitle("Jobs")
      .select(
        "Id",
        "Title",
        "Priority",
        "Status",
        "CustomerRating",
        "StartDate",
        "EndDate",
        "AssingToId",
      )
      .items.get();

    const myJobs = res.filter((job) => job.AssingToId === userId);

    /* Completed jobs */
    const completedJobs = myJobs.filter((job) => job.Status === "Completed");

    /* Rating */
    const totalRating = completedJobs.reduce(
      (sum, job) => sum + (Number(job.Rating) || 0),
      0,
    );

    const avgRating =
      completedJobs.length > 0
        ? (totalRating / completedJobs.length).toFixed(2)
        : 0;

    /* Total working hours */
    const totalMinutes = completedJobs.reduce((sum, job) => {
      if (job.StartDate && job.EndDate) {
        const start = new Date(job.StartDate).getTime();
        const end = new Date(job.EndDate).getTime();

        return sum + (end - start) / (1000 * 60);
      }
      return sum;
    }, 0);

    const totalHours = (totalMinutes / 60).toFixed(2);

    setUserActivities({
      totalCompleted: completedJobs.length,
      overallRating: avgRating,
      totalWorkingHours: totalHours,
    });
    setInterval(() => {
      setIsLoader(false);
    }, 1000);
  } catch (error) {
    console.log("Error :", error);
  }
};

export const getTodayjobsDetails = async (
  spWeb: any,
  setAllJobs: any,
  userId: number,
  setIsLoader: any,
) => {
  try {
    setIsLoader(true);
    const today = new Date().toDateString();
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
            .filter(
              (job: any) =>
                job.AssingToId === userId &&
                job.PreferedDate &&
                new Date(job.PreferedDate).toDateString() === today,
            )
            .map(async (job: any) => {
              const customer = customerDetails.find(
                (customer: any) => customer?.id === job.CustomerId,
              );

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

                signatureUrl: "",
              };
            }),
        );

        setAllJobs(tempJobDetails.reverse());

        setInterval(() => {
          setIsLoader(false);
        }, 1000);
      });
  } catch (error) {
    console.log("Error :", error);
  }
};
