/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import * as React from "react";
import { useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  ArrowRight,
  Zap,
  Star,
  Power,
  Activity,
  Trophy,
  Calendar,
  Clock,
} from "lucide-react";

import styles from "./HomeView.module.scss";

import { Web } from "@pnp/sp/presets/all";
import { IActivities } from "../../../config/interface";
import { getTime, getTimeAgo } from "../../../config/utils";
import {
  clockIn,
  clockOut,
  getActiveClockRecord,
  getAllActivities,
} from "../../../services/commonService";
import AiCard from "./AiCard/AiCard";
import {
  getBannerActivities,
  getUserActivities,
} from "../../../services/homeService";
import { useNavigate } from "react-router-dom";
import Loader from "../Loader/Loader";
// import { motion } from "framer-motion";
interface HomeViewProps {
  username: string;
  onViewAllActivities: () => void;
  onViewTodayJobs: () => void;
  openJobDetails: (jobId: number) => void;
}

export const useReveal = () => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
        }
      },
      { threshold: 0.2 },
    );

    if (ref.current) observer.observe(ref.current);

    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  });

  return { ref, visible };
};

const queries = [
  require("../../../assets/Images/banner/construction.gif"),
  require("../../../assets/Images/banner/drill.gif"),
  require("../../../assets/Images/banner/grinder.gif"),
  require("../../../assets/Images/banner/measuring-tape.gif"),
  require("../../../assets/Images/banner/paint-roller.gif"),
  require("../../../assets/Images/banner/pipe-wrench.gif"),
  require("../../../assets/Images/banner/pliers.gif"),
  require("../../../assets/Images/banner/saw.gif"),
  require("../../../assets/Images/banner/tools.gif"),
];

const HomeView: React.FC<HomeViewProps> = ({
  username,
  onViewAllActivities,
  onViewTodayJobs,
  openJobDetails,
}) => {
  const { ref, visible } = useReveal();
  const spWeb = Web("https://chandrudemo.sharepoint.com/sites/FieldService");
  const navigate = useNavigate();
  const [recentActivities, setRecentActivities] = useState<IActivities[]>([]);
  const [bannerActivities, setBannerActivities] = useState<string[]>([]);
  const [onGoingJob, setOnGoingJob] = useState<any>({});
  const [userActivities, setUserActivities] = useState<any>({});
  const [isClockedIn, setIsClockedIn] = useState(true);
  const [isLoader, setIsLoader] = useState(true);
  const [clockInOut, setClockInOut] = useState<any>({});
  const [clockInTime, setClockInTime] = useState<Date | null>(
    new Date(new Date().setHours(8, 42, 0)),
  );
  const [elapsed, setElapsed] = useState("00:00:00");
  const [index, setIndex] = useState(0);
  const [contentIndex, setContentIndex] = useState(0);

  useEffect(() => {
    let interval: number;
    if (isClockedIn && clockInTime) {
      interval = window.setInterval(() => {
        const now = new Date();
        const diff = now.getTime() - clockInTime.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setElapsed(
          `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
        );
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isClockedIn, clockInTime]);

  const initClockStatus = async () => {
    const user = await spWeb.currentUser.get();
    const activeRecord = await getActiveClockRecord(user.Id, spWeb);

    setClockInOut(activeRecord[0]);
    getBannerActivities(spWeb, setBannerActivities, setOnGoingJob, user.Id);
    getUserActivities(spWeb, setUserActivities, user.Id, setIsLoader);
    if (activeRecord?.length !== 0) {
      setIsClockedIn(true);
      setClockInTime(new Date(activeRecord[0].StartTime));
    } else {
      setIsClockedIn(false);
    }
  };

  useEffect(() => {
    getAllActivities(spWeb, setRecentActivities);
    initClockStatus();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % queries.length);
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setContentIndex((prev) => {
        if (prev + 1 === bannerActivities.length) {
          return 0;
        } else {
          return prev + 1;
        }
      });
    }, 5000);

    return () => clearInterval(timer);
  }, [bannerActivities]);

  const handleToggleClock = async () => {
    if (clockInOut && clockInOut?.Id) {
      await clockOut(spWeb, clockInOut.Id);
      initClockStatus();
      setIsClockedIn(false);
      setClockInOut({});
      setClockInTime(null);
    } else {
      await clockIn(spWeb);
      initClockStatus();
      setIsClockedIn(true);
      setClockInTime(new Date());
    }
  };

  return isLoader ? (
    <Loader />
  ) : (
    <div
      // className={styles.homeContainer}
      ref={ref}
      className={`reveal ${visible ? "revealVisible" : ""} ${styles.homeContainer}`}
    >
      <div className={styles.premiumBanner}>
        <div
          className={`reveal ${visible ? "revealVisible" : ""} ${styles.bannerContent}`}
          ref={ref}
        >
          <div className={styles.badge}>
            <Zap size={10} color="#fde047" fill="currentColor" />
            Duty Active
          </div>

          <h2 className={styles.bannerTitle}>
            Good shift,
            <br />
            <span>{username}.</span>
          </h2>

          <p key={contentIndex} className={styles.bannerSubtitle}>
            {bannerActivities[contentIndex]}
          </p>

          <button className={styles.primaryButton} onClick={onViewTodayJobs}>
            Go to Jobs
            <ArrowRight size={16} />
          </button>
        </div>

        <div
          //   animate={{ y: [0, -50, 0] }}
          //   transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className={styles.bannerImage}
        >
          {/* <img src="https://img.icons8.com/clouds/200/wrench.png" alt="Asset" /> */}
          <img src={queries[index]} alt="Asset" />
        </div>
      </div>

      <div className={styles.cardsGrid}>
        <div
          onClick={handleToggleClock}
          className={`${styles.clockCard} ${
            isClockedIn ? styles.on : styles.off
          }`}
        >
          <div className={styles.cardBgIcon}>
            <Activity size={80} />
          </div>
          <div className={styles.clockIcon}>
            <Power size={20} />
          </div>

          {isClockedIn ? (
            <>
              <p className={styles.label}>Session Time</p>
              <p className={styles.time}>{elapsed}</p>
              <p className={styles.hint}>Tap to Finish</p>
            </>
          ) : (
            <>
              <p className={styles.label}>Current Status</p>
              <p className={styles.time}>Off Duty</p>
              <p className={styles.hint}>Tap to Clock In</p>
            </>
          )}
        </div>

        <div className={styles.ratingCard}>
          <div className={styles.cardBgIcon}>
            <Trophy size={80} />
          </div>
          <div className={styles.ratingIcon}>
            <Star size={20} fill="currentColor" />
          </div>
          <p className={styles.label}>Net Rating</p>
          <div className={styles.ratingValueRow}>
            <p className={styles.ratingValue}>
              {userActivities?.overallRating}
            </p>
            <span className={styles.ratingMax}>/5.0</span>
          </div>
          <p className={styles.hint}>Top 1% Technician</p>
        </div>
      </div>

      {onGoingJob?.Id && (
        <div className={styles.ongoingCard}>
          <div className={styles.jobHeader}>
            <div className={styles.jobStatus}>
              {/* <div className={styles.rotateIcon}></div> */}
              <span>On Going</span>
            </div>

            <div
              className={
                onGoingJob?.Priority === "High"
                  ? styles.priorityHigh
                  : onGoingJob?.Priority === "Medium"
                    ? styles.priorityMedium
                    : styles.priorityLow
              }
            >
              {onGoingJob?.Priority}
            </div>
          </div>

          <h3 className={styles.jobTitle}>{onGoingJob?.Title}</h3>

          <p className={styles.jobDescription}>{onGoingJob?.Descriptions}</p>

          <div className={styles.jobFooter}>
            <div className={styles.startTime}>
              <Clock size={12} /> Started at {getTime(onGoingJob?.StartDate)}
            </div>

            <button
              className={styles.openJobBtn}
              onClick={() => navigate(`/jobs/${onGoingJob?.Id}`)}
            >
              View <ArrowRight size={14} />
            </button>
          </div>
          <img
            className={styles.inProgressImage}
            src={require("../../../assets/Images/timer.gif")}
            alt="timer"
          />
        </div>
      )}

      <div
        ref={ref}
        className={`reveal ${visible ? "revealVisible" : ""} ${styles.logsSection}`}
      >
        <div className={styles.logsHeader}>
          <h3>Recent Activities</h3>
          <button onClick={onViewAllActivities} className={styles.historyBtn}>
            View all <ArrowRight size={14} />
          </button>
        </div>

        <div className={styles.logsList}>
          {recentActivities
            .slice(0, 3)
            .map((activity: IActivities, index: number) => (
              <div
                key={index}
                className={styles.logCard}
                onClick={() => openJobDetails(activity.job)}
              >
                <div
                  className={`${styles.logIcon} ${
                    activity.title === "Job Completed"
                      ? styles.green
                      : styles.blue
                  }`}
                >
                  <CheckCircle2 size={20} />
                </div>

                <div className={styles.logContent}>
                  <div className={styles.logHeader}>
                    <p className={styles.logType}>{activity.title}</p>
                    <div className={styles.activityTime}>
                      <Calendar size={10} />
                      {getTimeAgo(activity.created)}
                    </div>
                  </div>
                  <p className={styles.logDescription}>
                    {activity.description}
                  </p>
                </div>
              </div>
            ))}
        </div>
      </div>
      <AiCard />
    </div>
  );
};

export default HomeView;
