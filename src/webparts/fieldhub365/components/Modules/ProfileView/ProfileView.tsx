/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import * as React from "react";
import { useEffect, useState } from "react";
import {
  Settings,
  Mail,
  Phone,
  MapPin,
  Award,
  Shield,
  UserCheck,
  Star,
  Zap,
  Globe,
  Clock,
  Box,
} from "lucide-react";

import styles from "./ProfileView.module.scss";
import { useReveal } from "../HomeView/HomeView";
import { getUserActivities } from "../../../services/homeService";
import { Web } from "@pnp/sp/presets/all";
import Loader from "../Loader/Loader";
// import { Web } from "@pnp/sp/presets/all";

interface ProfileViewProps {
  employeeInformations: any;
}

const ProfileView: React.FC<ProfileViewProps> = ({ employeeInformations }) => {
  const { ref, visible } = useReveal();
  const spWeb = Web("https://chandrudemo.sharepoint.com/sites/FieldService");
  const [employeeDetails, setEmployeeDetails] = useState<any>();
  const [userActivities, setUserActivities] = useState<any>({});
  const [isLoader, setIsLoader] = useState(false);

  useEffect(() => {
    if (employeeInformations) {
      setEmployeeDetails(employeeInformations);
    }
  }, [employeeInformations]);

  useEffect(() => {
    const init = async () => {
      const user = await spWeb.currentUser.get();
      getUserActivities(spWeb, setUserActivities, user.Id, setIsLoader);
    };
    init();
  }, []);

  return isLoader ? (
    <Loader />
  ) : (
    <div
      ref={ref}
      className={`reveal ${visible ? "revealVisible" : ""} ${styles.profileContainer}`}
    >
      <div className={styles.profileBanner}>
        <div className={styles.settingsBtn}>
          <button>
            <Settings size={22} />
          </button>
        </div>

        <div className={styles.avatarWrapper}>
          <div className={styles.avatar}>
            <img
              src={
                "/_layouts/15/userphoto.aspx?size=L&username=" +
                employeeDetails?.contactEmail
              }
              alt="Avatar"
            />
          </div>
          <div className={styles.statusIndicator} />
        </div>

        <h2>{employeeDetails?.employee}</h2>
        <div className={styles.roleBadge}>{employeeDetails?.role}</div>

        <div className={styles.miniBadges}>
          <MiniBadge
            icon={<Star size={14} fill="currentColor" />}
            label="Avg Star"
            value={userActivities?.overallRating}
            color={styles.amber}
          />
          <MiniBadge
            icon={<Zap size={14} fill="currentColor" />}
            label="Activity"
            value="High"
            color={styles.indigo}
          />
          <MiniBadge
            icon={<Award size={14} />}
            label="Level"
            value="Gold"
            color={styles.purple}
          />
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3>Global Impact</h3>
          <Globe size={18} color="#9cbde4" />
        </div>

        <div className={styles.impactGrid}>
          <ImpactTile
            label="Jobs Closed"
            value={userActivities?.totalCompleted}
            trend="+5%"
            icon={<Box size={18} />}
          />
          <ImpactTile
            label="Speed Index"
            value="42m"
            trend="-2m"
            icon={<Clock size={18} />}
          />
          <ImpactTile
            label="Trust Score"
            value="99%"
            trend="+1%"
            icon={<Shield size={18} />}
          />
          <ImpactTile
            label="Referrals"
            value="242"
            trend="+12"
            icon={<UserCheck size={18} />}
          />
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3>Skillsets</h3>
        </div>
        <div className={styles.skills}>
          {employeeDetails?.skillSets?.map((skill: any, idx: number) => (
            <span key={idx} className={styles.skillPill}>
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3>Others</h3>
        </div>
        <div className={styles.infoCard}>
          <InfoRow
            icon={<Mail size={18} color="#cbd5e1" />}
            label="Email"
            value={employeeDetails?.contactEmail}
          />
          <InfoRow
            icon={<Phone size={18} color="#cbd5e1" />}
            label="Phone"
            value={employeeDetails?.contactNo}
          />
          <InfoRow
            icon={<MapPin size={18} color="#cbd5e1" />}
            label="Location"
            value={employeeDetails?.city}
          />
        </div>
      </div>
    </div>
  );
};

const MiniBadge: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}> = ({ icon, label, value, color }) => (
  <div className={`${styles.miniBadge} ${color}`}>
    <div>{icon}</div>
    <p className={styles.miniValue}>{value}</p>
    <p className={styles.miniLabel}>{label}</p>
  </div>
);

const ImpactTile: React.FC<{
  label: string;
  value: string;
  trend: string;
  icon: React.ReactNode;
}> = ({ label, value, trend, icon }) => (
  <div className={styles.impactTile}>
    <div className={styles.impactIcon}>{icon}</div>
    <p className={styles.impactLabel}>{label}</p>
    <div className={styles.impactBottom}>
      <h4>{value}</h4>
      {trend && <span className={styles.trend}>{trend}</span>}
    </div>
  </div>
);

const InfoRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
}> = ({ icon, label, value }) => (
  <div className={styles.infoRow}>
    <div className={styles.infoIcon}>{icon}</div>
    <div className={styles.infoContent}>
      <p className={styles.infoLabel}>{label}</p>
      <p className={styles.infoValue} title={value}>
        {value}
      </p>
    </div>
    {/* <ChevronRight size={16} /> */}
  </div>
);

export default ProfileView;
