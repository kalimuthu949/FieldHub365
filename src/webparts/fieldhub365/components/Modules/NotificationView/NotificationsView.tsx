/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import * as React from "react";
import {
  Bell,
  CheckCircle,
  AlertCircle,
  Info,
  XCircle,
  Clock,
  //   MoreHorizontal,
  //   Trash2,
  Check,
  CheckCheck,
} from "lucide-react";

import styles from "./NotificationsView.module.scss";
import { INotification } from "../../../config/interface";
import { useEffect, useState } from "react";
import { Web } from "@pnp/sp/presets/all";
import { getNotifications } from "../../../services/commonService";
import { useReveal } from "../HomeView/HomeView";
import Loader from "../Loader/Loader";

interface INotificationCardProps {
  notification: INotification;
  index: number;
  getIcon: (type: string) => React.ReactNode;
}

const NotificationsView: React.FC = () => {
  const { ref, visible } = useReveal();
  const spWeb = Web("https://chandrudemo.sharepoint.com/sites/FieldService");

  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [isLoader, setIsLoader] = useState(true);
  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle size={18} className={styles.successIcon} />;
      case "warning":
        return <AlertCircle size={18} className={styles.warningIcon} />;
      case "error":
        return <XCircle size={18} className={styles.errorIcon} />;
      default:
        return <Info size={18} className={styles.infoIcon} />;
    }
  };

  const todayNotifications = notifications.filter(
    (n) => !n.time.includes("Yesterday") && !n.time.includes("days"),
  );

  const earlierNotifications = notifications.filter(
    (n) => n.time.includes("Yesterday") || n.time.includes("days"),
  );

  const markAsReadFunction = async (isSingle: boolean, recId?: number) => {
    try {
      if (isSingle && recId) {
        await spWeb.lists
          .getByTitle("Notifications")
          .items.getById(recId)
          .update({
            MarkAsRead: true,
          });

        setNotifications((prev) =>
          prev.map((item) =>
            item.id === recId ? { ...item, isRead: true } : item,
          ),
        );
      } else {
        const unread = notifications.filter((n) => !n.isRead);
        await Promise.all(
          unread.map((notification) =>
            spWeb.lists
              .getByTitle("Notifications")
              .items.getById(notification.id)
              .update({
                MarkAsRead: true,
              }),
          ),
        );

        setNotifications((prev) =>
          prev.map((item) => ({ ...item, isRead: true })),
        );
      }
    } catch (error) {
      console.log("Error :", error);
    }
  };

  useEffect(() => {
    (async () => {
      const user = await spWeb.currentUser.get();
      getNotifications(spWeb, setNotifications, user.Email, setIsLoader);
    })();
  }, []);

  const NotificationCard: React.FC<INotificationCardProps> = ({
    notification,
    index,
    getIcon,
  }) => {
    return (
      <div
        //   initial={{ opacity: 0, y: 20 }}
        //   animate={{ opacity: 1, y: 0 }}
        //   transition={{ delay: index * 0.05 }}
        className={`${styles.card} ${notification.isRead ? "" : styles.unread}`}
      >
        {/* <div className={styles.accent}></div> */}

        <div className={styles.cardContent}>
          <div className={styles.iconBox}>{getIcon(notification.type)}</div>

          <div className={styles.body}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>{notification.title}</h3>

              {!notification.isRead && (
                <span className={styles.unreadDot}>New</span>
              )}

              {/* <MoreHorizontal size={14} /> */}
            </div>

            <p className={styles.message}>{notification.message}</p>

            <div className={styles.footer}>
              <div className={styles.time}>
                <Clock size={12} />
                {notification.time}
              </div>

              {!notification.isRead ? (
                <div>
                  <a
                    className={styles.markAsRead}
                    onClick={() => markAsReadFunction(true, notification.id)}
                  >
                    Mark as read
                  </a>
                </div>
              ) : (
                <div className={styles.time}>
                  <CheckCheck size={12} />
                  <span>Readed</span>
                </div>
              )}

              {/* <div className={styles.actions}>
              <button className={styles.deleteBtn}>
                <Trash2 size={14} />
              </button>

              <button className={styles.viewBtn}>View</button>
            </div> */}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const SectionTitle: React.FC<{ title: string }> = ({ title }) => {
    return (
      <div className={styles.sectionTitle}>
        <span>{title}</span>
        <div className={styles.line}></div>
      </div>
    );
  };

  return isLoader ? (
    <Loader />
  ) : (
    <div
      ref={ref}
      className={`reveal ${visible ? "revealVisible" : ""} ${styles.container}`}
    >
      <div className={styles.wrapper}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.iconCircle}>
              <Bell size={16} />
            </div>
            <h2 className={styles.title}>Inbox</h2>
          </div>

          <button
            className={styles.markAllBtn}
            onClick={() => markAsReadFunction(false)}
          >
            <Check size={12} />
            Mark all read
          </button>
        </div>

        {/* Today */}
        {todayNotifications.length !== 0 && <SectionTitle title="Today" />}

        {todayNotifications.map((notification, index) => (
          <NotificationCard
            key={notification.id}
            notification={notification}
            index={index}
            getIcon={getIcon}
          />
        ))}

        {/* Earlier */}
        {earlierNotifications.length !== 0 && <SectionTitle title="Earlier" />}

        {earlierNotifications.map((notification, index) => (
          <NotificationCard
            key={notification.id}
            notification={notification}
            index={index}
            getIcon={getIcon}
          />
        ))}

        {/* Empty */}
        <div className={styles.emptyState}>
          <Bell size={28} />
          <h3 style={{ margin: "10px 0px 5px 0px" }}>You're all caught up!</h3>
          <p style={{ margin: "0px" }}>Check back later for new updates.</p>
        </div>
      </div>
    </div>
  );
};

export default NotificationsView;
