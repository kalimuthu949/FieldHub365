/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import * as React from "react";
import { FileText, Calendar, CheckCircle2 } from "lucide-react";
import styles from "./ActivityHistoryView.module.scss";
import { IActivities } from "../../../config/interface";
import { getTimeAgo } from "../../../config/utils";
import { useEffect, useState } from "react";
import { getAllActivities } from "../../../services/commonService";
import { Web } from "@pnp/sp/presets/all";
import { useReveal } from "../HomeView/HomeView";
import Loader from "../Loader/Loader";

interface ActivityHistoryViewProps {
  openJobDetails: (jobId: number) => void;
}

const ActivityHistoryView: React.FC<ActivityHistoryViewProps> = ({
  openJobDetails,
}) => {
  const { ref, visible } = useReveal();
  const spWeb = Web("https://chandrudemo.sharepoint.com/sites/FieldService");
  const [recentActivities, setRecentActivities] = useState<IActivities[]>([]);
  const [isLoader, setIsLoader] = useState(true);

  useEffect(() => {
    getAllActivities(spWeb, setRecentActivities, setIsLoader);
  }, []);

  return isLoader ? (
    <Loader />
  ) : (
    <div
      ref={ref}
      className={`reveal ${visible ? "revealVisible" : ""} ${styles["activity-container"]}`}
    >
      {/* <div className={styles["activity-header"]}>
        <div>
          <h2 className={styles["activity-title"]}>Activity Stream</h2>
          <p className={styles["activity-subtitle"]}>
            Logged events for this cycle
          </p>
        </div>

        <button className={styles["filter-button"]}>
          <Filter size={20} />
        </button>
      </div> */}

      {/* Timeline */}
      <div className={styles.timeline}>
        {recentActivities?.map((activity: IActivities, idx: number) => (
          <div
            key={`${activity.id}-${idx}`}
            className={styles["timeline-item"]}
            onClick={() => openJobDetails(activity.job)}
          >
            <div className={styles["timeline-dot"]}>
              <CheckCircle2 size={18} color="#16a34a" />
            </div>

            <div className={styles["activity-card"]}>
              <div className={styles["card-header"]}>
                <span className={styles["activity-type"]}>
                  {activity.title}
                </span>

                <div className={styles["activity-time"]}>
                  <Calendar size={10} />
                  {getTimeAgo(activity.created)}
                </div>
              </div>

              <p className={styles["activity-description"]}>
                {activity.description}
              </p>

              <button className={styles["audit-button"]}>
                <FileText size={12} />
                Detailed Audit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityHistoryView;
