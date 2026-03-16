/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import * as React from "react";
import { Job } from "../../../../config/interface";
import {
  CalendarDays,
  Clock,
  MapPin,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";
import { useReveal } from "../../HomeView/HomeView";
import * as dayjs from "dayjs";

interface DetailsTabProps {
  job: Job;
}

const DetailsTab: React.FC<DetailsTabProps> = ({ job }) => {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      className={`reveal ${visible ? "revealVisible" : ""} details-tab`}
    >
      <div className="details-card">
        <h3 className="card-title">Client Contact</h3>
        <DetailItem
          icon={<User size={18} className="detail-icon" />}
          label="Full Name"
          value={job.customer}
        />
        <DetailItem
          icon={<Phone size={18} className="detail-icon" />}
          label="Primary Phone"
          value={job.contactNo}
        />
        <DetailItem
          icon={<MapPin size={18} className="detail-icon" />}
          label="Service Address"
          value={job.address}
        />
      </div>

      <div className="details-card">
        <h3 className="card-title">Job Specifications</h3>
        <DetailItem
          icon={<CalendarDays size={18} className="detail-icon" />}
          label="Prefered Date"
          value={dayjs(job.preferedDate).format("DD/MM/YYYY") || ""}
        />
        <DetailItem
          icon={<Clock size={18} className="detail-icon" />}
          label="Time Slot"
          value={job.timeSlot || ""}
        />
        <DetailItem
          icon={<ShieldCheck size={18} className="detail-icon" />}
          label="Warranty Status"
          value="Active (Valid until 2026)"
        />
        <div className="notes-section">
          <p className="notes-label">Technician Notes</p>
          <p className="notes-content">
            Ensure filter unit is calibrated for high efficiency. Previous
            technician noted slight wear on the primary gasket. Spare parts are
            located in van inventory under bin B-12.
          </p>
        </div>
      </div>
    </div>
  );
};

export default React.memo(DetailsTab);

interface DetailItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const DetailItem: React.FC<DetailItemProps> = ({ icon, label, value }) => (
  <div className="detail-item">
    <div className="detail-icon-wrapper">{icon}</div>
    <div className="detail-content">
      <p className="detail-label">{label}</p>
      <p className="detail-value">{value}</p>
    </div>
  </div>
);
