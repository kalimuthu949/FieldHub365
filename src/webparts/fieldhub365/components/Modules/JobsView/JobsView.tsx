/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import * as React from "react";
import { useState, useMemo, useEffect } from "react";
import {
  Search,
  ListTodo,
  MapPin,
  Clock,
  ChevronRight,
  AlertCircle,
  PlayCircle,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

import styles from "./JobsView.module.scss";
import { Job, JobStatus } from "../../../config/interface";
import { getTime } from "../../../config/utils";
import { Web } from "@pnp/sp/presets/all";
import { useReveal } from "../HomeView/HomeView";
import { getTodayjobsDetails } from "../../../services/homeService";
import Loader from "../Loader/Loader";

interface JobsViewProps {
  onViewAllJobs: () => void;
  onJobClick: (job: Job) => void;
}

const JobsView: React.FC<JobsViewProps> = ({ onViewAllJobs, onJobClick }) => {
  const { ref, visible } = useReveal();
  const spWeb = Web("https://chandrudemo.sharepoint.com/sites/FieldService");
  const [activeFilter, setActiveFilter] = useState<JobStatus | "Overall">(
    "Overall",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [isLoader, setIsLoader] = useState(true);

  const stats = useMemo(
    () => ({
      total: allJobs.length,
      notStarted: allJobs.filter((j) => j.status === JobStatus.NOT_STARTED)
        .length,
      inProgress: allJobs.filter((j) => j.status === JobStatus.IN_PROGRESS)
        .length,
      completed: allJobs.filter((j) => j.status === JobStatus.COMPLETED).length,
    }),
    [allJobs],
  );

  const filteredJobs = useMemo(() => {
    return allJobs.filter((job) => {
      const matchesFilter =
        activeFilter === "Overall" || job?.status === activeFilter;
      const matchesSearch =
        job?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job?.customer?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, searchQuery, allJobs]);

  useEffect(() => {
    const initClockStatus = async () => {
      const user = await spWeb.currentUser.get();
      getTodayjobsDetails(spWeb, setAllJobs, user.Id, setIsLoader);
    };
    initClockStatus();
  }, []);

  return isLoader ? (
    <Loader />
  ) : (
    <div
      ref={ref}
      className={`reveal ${visible ? "revealVisible" : ""} ${styles.todayjob_container}`}
    >
      <div className={styles.jobsHeader}>
        <div>
          <h2>Today Assignments</h2>
          {/* <p>Current Load Management</p> */}
        </div>
      </div>

      <div className={styles.metricsGrid}>
        <MetricCard
          label="Overall"
          count={stats.total}
          active={activeFilter === "Overall"}
          onClick={() => setActiveFilter("Overall")}
          color="#5B5FC7"
          icon={<ListTodo size={16} />}
        />
        <MetricCard
          label="Not Started"
          count={stats.notStarted}
          active={activeFilter === JobStatus.NOT_STARTED}
          onClick={() => setActiveFilter(JobStatus.NOT_STARTED)}
          color="#ec2f2f"
          icon={<AlertCircle size={16} />}
        />
        <MetricCard
          label="In Progress"
          count={stats.inProgress}
          active={activeFilter === JobStatus.IN_PROGRESS}
          onClick={() => setActiveFilter(JobStatus.IN_PROGRESS)}
          color="#F5A623"
          icon={<PlayCircle size={16} />}
        />
        <MetricCard
          label="Completed"
          count={stats.completed}
          active={activeFilter === JobStatus.COMPLETED}
          onClick={() => setActiveFilter(JobStatus.COMPLETED)}
          color="#10B981"
          icon={<CheckCircle size={16} />}
        />
      </div>

      <div className={styles.searchContainer}>
        <Search className={styles.searchIcon} size={20} />
        <input
          type="text"
          placeholder="Filter your jobs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div>
        <div className={styles.taskHeader}>
          <h3>{activeFilter} Jobs</h3>
          <button onClick={onViewAllJobs} className={styles.inventoryBtn}>
            All jobs <ArrowRight size={14} />
          </button>
        </div>

        {filteredJobs.slice(0, 4).map((job) => (
          <CompactJobCard
            key={job.id}
            job={job}
            onClick={() => onJobClick(job)}
          />
        ))}

        {filteredJobs.length > 4 && (
          <button onClick={onViewAllJobs} className={styles.viewMore}>
            + View {filteredJobs.length - 4} more assignments
          </button>
        )}
      </div>
    </div>
  );
};

const MetricCard: React.FC<{
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  color: string;
  icon: React.ReactNode;
}> = ({ label, count, active, onClick, color, icon }) => (
  <button
    onClick={onClick}
    className={`${styles.metricCard} ${active ? styles.active : ""}`}
  >
    <div
      className={styles.metricIcon}
      style={{ color: active ? color : undefined }}
    >
      {icon}
    </div>
    <span className={styles.metricCount}>{count}</span>
    <span className={styles.metricLabel}>{label}</span>
  </button>
);

const CompactJobCard: React.FC<{ job: Job; onClick: () => void }> = ({
  job,
  onClick,
}) => {
  const priorityClass =
    job.priority === "High"
      ? styles.priorityHigh
      : job.priority === "Medium"
        ? styles.priorityMedium
        : styles.priorityLow;

  const statusClass =
    job.status === JobStatus.COMPLETED
      ? styles.statusCompleted
      : job.status === JobStatus.IN_PROGRESS
        ? styles.statusProgress
        : styles.statusDefault;

  return (
    <div className={styles.jobViewCard} onClick={onClick}>
      <div className={`${styles.statusBar} ${statusClass}`} />
      <div className={styles.jobContent}>
        <div className={styles.jobTop}>
          <span className={styles.viewJobId}>J000{job.id}</span>
          <span className={`${styles.viewPriorityBadge} ${priorityClass}`}>
            {job.priority}
          </span>
        </div>
        <h4>{job.title}</h4>
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
      <div className={styles.jobArrow}>
        <ChevronRight size={20} />
      </div>
    </div>
  );
};

export default JobsView;
