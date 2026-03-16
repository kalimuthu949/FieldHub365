/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import {
  Info,
  Paperclip,
  PenTool,
  CheckCircle,
  Clock,
  PlayCircle,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import "./TaskDetailView.css";
import { useParams } from "react-router-dom";
import { Job, JobStatus } from "../../../config/interface";
import SignatureTab from "./SignatureTab/SignatureTab";
import AttachmentsTab from "./AttachmentsTab/AttachmentsTab";
import DetailsTab from "./DetailsTab/DetailsTab";
// import AIChatTab from "./AIChatTab/AIChatTab";
import SlideToBuy from "../../Common/SlideToBtn";
import { Web } from "@pnp/sp/presets/all";
import { getTimeDifference } from "../../../config/utils";
import { getjobsDetails } from "../../../services/commonService";
import CoPilotChat from "./AIChatBot/ChatBot";
import Loader from "../Loader/Loader";

const TaskDetailView: React.FC = () => {
  const spWeb = Web("https://chandrudemo.sharepoint.com/sites/FieldService");

  const [activeTab, setActiveTab] = useState<
    "details" | "ai" | "attachments" | "signature"
  >("details");

  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [isLoader, setIsLoader] = useState(true);
  // const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [time, setTime] = useState("00:00:00");
  const { jobId } = useParams();

  const startJobFunction = async () => {
    try {
      const user = await spWeb.currentUser.get();
      await spWeb.lists
        .getByTitle("Jobs")
        .items.getById(Number(jobId))
        .update({
          Status: "In Progress",
          StartDate: new Date(),
        })

        .then(async (res) => {
          await spWeb.lists.getByTitle("Activities").items.add({
            Title: "Job Started",
            Description: `J000${jobId} has been started by ${(await user).Title}`,
            JobId: Number(jobId),
          });
          setAllJobs((prev) => {
            return prev.map((job) =>
              job.id === Number(jobId)
                ? {
                    ...job,
                    status: JobStatus.IN_PROGRESS,
                    startDate: new Date().toISOString(),
                  }
                : job,
            );
          });
        });
    } catch (error) {
      console.log("Error :", error);
    }
  };

  const selectedJob = useMemo(() => {
    return allJobs.find((j) => Number(j.id) === Number(jobId)) || null;
  }, [allJobs, jobId]);

  useEffect(() => {
    const initClockStatus = async () => {
      const user = await spWeb.currentUser.get();
      getjobsDetails(spWeb, setAllJobs, user.Id, setIsLoader);
    };
    initClockStatus();
  }, []);

  useEffect(() => {
    if (!selectedJob?.startDate || selectedJob.endDate) return;
    const interval = setInterval(() => {
      setTime(getTimeDifference(selectedJob.startDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [selectedJob?.startDate]);

  if (!selectedJob) return null;

  const statusClass =
    selectedJob.status === JobStatus.COMPLETED
      ? "completed"
      : selectedJob.status === JobStatus.IN_PROGRESS
        ? "in_progress"
        : "pending";

  return isLoader ? (
    <Loader />
  ) : (
    <div className="task-detail-container">
      {/* Premium Job Header */}
      <div className="job-header">
        <div className="header-top">
          <div className="job-id-status">
            <span className="detail-job-id">J000{selectedJob.id}</span>
            <div className={`status-badge ${statusClass}`}>
              {selectedJob.status === JobStatus.COMPLETED ? (
                <CheckCircle size={16} />
              ) : selectedJob.status === JobStatus.IN_PROGRESS ? (
                <PlayCircle size={16} />
              ) : (
                <AlertCircle size={16} />
              )}
              <span className="status-text">{selectedJob.status}</span>
            </div>
          </div>
          <div>
            <h2 className="task-detail-job-title">{selectedJob.title}</h2>
            <span style={{ opacity: "0.8", fontSize: "12px" }}>
              {selectedJob.description}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div className="priority-container">
            <div
              className={`priority-badge ${selectedJob.priority === "High" ? "high" : "normal"}`}
            >
              {selectedJob.priority} Priority
            </div>
            {selectedJob.status !== JobStatus.NOT_STARTED && (
              <div className="time-badge">
                <Clock size={12} />
                {selectedJob.startDate && selectedJob.endDate
                  ? getTimeDifference(
                      selectedJob?.startDate,
                      selectedJob.endDate,
                    )
                  : selectedJob.startDate
                    ? time
                    : "Not Started"}
              </div>
            )}
          </div>
          {/* <div>
            <button type="button">Start Job</button>
          </div> */}
          {selectedJob.status === JobStatus.NOT_STARTED && (
            <SlideToBuy startJobFunction={startJobFunction} />
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-nav-wrapper">
        <div className="tab-nav-container">
          <TabButton
            active={activeTab === "details"}
            onClick={() => setActiveTab("details")}
            icon={<Info size={16} />}
            label="Info"
          />
          <TabButton
            active={activeTab === "ai"}
            onClick={() => setActiveTab("ai")}
            icon={<Sparkles size={16} />}
            label="AI Hub"
          />
          <TabButton
            active={activeTab === "attachments"}
            onClick={() => setActiveTab("attachments")}
            icon={<Paperclip size={16} />}
            label="Media"
          />
          <TabButton
            active={activeTab === "signature"}
            onClick={() => setActiveTab("signature")}
            icon={<PenTool size={16} />}
            label="Sign"
          />
        </div>
      </div>

      {/* Tab Content */}
      <div className="job-tab-content">
        <div>
          {activeTab === "details" && (
            <DetailsTab key="details" job={selectedJob} />
          )}
          {activeTab === "ai" && <CoPilotChat isMain={false} />}
          {/* {activeTab === "ai" && <AIChatTab key="ai" job={selectedJob} />} */}
          {activeTab === "attachments" && (
            <AttachmentsTab job={selectedJob} key="attachments" />
          )}
          {activeTab === "signature" && (
            <SignatureTab key="signature" job={selectedJob} />
          )}
        </div>
      </div>
    </div>
  );
};

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const TabButton: React.FC<TabButtonProps> = ({
  active,
  onClick,
  icon,
  label,
}) => (
  <button onClick={onClick} className={`tab-button ${active ? "active" : ""}`}>
    {icon}
    <span className="tab-label">{label}</span>
  </button>
);

export default TaskDetailView;
