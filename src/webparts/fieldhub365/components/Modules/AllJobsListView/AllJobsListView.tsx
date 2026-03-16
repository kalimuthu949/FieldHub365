/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  MapPin,
  ChevronRight,
  // SlidersHorizontal,
  Clock,
  CheckCircle,
  Hourglass,
  AlertCircle,
} from "lucide-react";
import styles from "./AllJobsListView.module.scss";
import { Job, JobStatus } from "../../../config/interface";
import { getTime } from "../../../config/utils";
import { getjobsDetails } from "../../../services/commonService";
import { Web } from "@pnp/sp/presets/all";
import { useReveal } from "../HomeView/HomeView";
import Loader from "../Loader/Loader";

interface AllJobsListViewProps {
  onJobClick: (job: Job) => void;
}

const AllJobsListView: React.FC<AllJobsListViewProps> = ({ onJobClick }) => {
  const { ref, visible } = useReveal();
  const spWeb = Web("https://chandrudemo.sharepoint.com/sites/FieldService");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [isLoader, setIsLoader] = useState(true);
  // const [filtered, setFiltered] = useState<Job[]>([]);

  //   const filtered: Job[] = allJobs?.filter((j: Job) =>
  //     j.title.toLowerCase().includes(query.toLowerCase()),
  //         );

  const onFilterFunction = (value: string) => {
    setSearchQuery(value);
    // setFiltered(
    //   allJobs?.filter((j: Job) =>
    //     j.title.toLowerCase().includes(searchQuery.toLowerCase()),
    //   ),
    // );
  };

  const filteredJobs = useMemo(() => {
    return allJobs.filter((job) => {
      const matchesSearch =
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.customer.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter =
        activeFilter === "All" ||
        job.status === activeFilter ||
        job.priority === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, activeFilter, allJobs]);

  // useEffect(() => {
  //   if (allJobs.length > 0) {
  //     setFiltered([...allJobs]);
  //   }
  // }, [allJobs]);

  useEffect(() => {
    const initClockStatus = async () => {
      const user = await spWeb.currentUser.get();
      getjobsDetails(spWeb, setAllJobs, user.Id, setIsLoader);
    };
    initClockStatus();
  }, []);

  return isLoader ? (
    <Loader />
  ) : (
    <div
      ref={ref}
      className={`reveal ${visible ? "revealVisible" : ""} ${styles.jobsContainer}`}
    >
      {/* Search Section */}
      <div className={styles.searchSection}>
        <div className={styles.SearchContainer}>
          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} size={20} />

            <input
              value={searchQuery}
              onChange={(e) => onFilterFunction(e.target.value)}
              placeholder="Search full registry..."
              className={styles.searchInput}
            />

            {/* <button className={styles.filterBtn}>
            <SlidersHorizontal size={18} />
          </button> */}
          </div>
          <div>
            <img
              src={require("../../../assets/Images/refreshIcon.png")}
              className={styles.refresh}
              onClick={() => {
                setIsLoader(false);
                setActiveFilter("All");
                setSearchQuery("");
                setIsLoader(true);
              }}
            ></img>
          </div>
        </div>
        {/* Tags */}
        <div className={styles.tagsContainer}>
          {[
            "Not Started",
            "In Progress",
            "Completed",
            "High",
            "Medium",
            "Low",
          ].map((tag) => (
            <button
              key={tag}
              className={`${styles.tagBtn} ${
                activeFilter === tag ? styles.activeTag : ""
              }`}
              onClick={() => setActiveFilter(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className={styles.resultsSection}>
        <h3 className={styles.resultsTitle}>Results ({filteredJobs.length})</h3>

        {filteredJobs.length === 0 ? (
          <div className={styles.noData}>No data found !</div>
        ) : (
          filteredJobs.map((job: Job, idx: number) => {
            const priorityClass =
              job.priority === "High"
                ? styles.priorityHigh
                : job.priority === "Medium"
                  ? styles.priorityMedium
                  : styles.priorityLow;

            const statusClass =
              job.status === JobStatus.COMPLETED
                ? styles.completed
                : job.status === JobStatus.IN_PROGRESS
                  ? styles.inProgress
                  : styles.pending;

            return (
              <div
                key={idx}
                className={styles.jobCard}
                onClick={() => onJobClick(job)}
              >
                <div className={`${styles.jobIcon} ${statusClass}`}>
                  {job.status === "Completed" ? (
                    <CheckCircle size={20} />
                  ) : job.status === "In Progress" ? (
                    <Hourglass size={20} />
                  ) : (
                    <AlertCircle size={20} />
                  )}
                </div>

                <div className={styles.jobInfo}>
                  <div className={styles.jobTop}>
                    <span className={styles.jobId}>J000{job.id}</span>
                    <span
                      className={`${styles.priorityBadge} ${priorityClass}`}
                    >
                      {job.priority}
                    </span>
                  </div>

                  <h4 className={styles.jobTitle}>{job.title}</h4>

                  <div className={styles.jobMeta}>
                    <span>
                      <MapPin size={12} /> {job.customer}
                    </span>
                    <span>
                      <Clock size={12} />
                      {job.startDate && job.endDate
                        ? getTime(job.startDate) + " - " + getTime(job.endDate)
                        : job.startDate
                          ? getTime(job.startDate) + " - In Progress"
                          : "Not started"}
                    </span>
                  </div>
                </div>

                <ChevronRight className={styles.chevron} size={20} />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AllJobsListView;
