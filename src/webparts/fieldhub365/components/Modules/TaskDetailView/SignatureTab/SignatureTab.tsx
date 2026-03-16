/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import * as React from "react";
import { useRef, useState } from "react";
import { X } from "lucide-react";
import { Toast } from "primereact/toast";
import { Job, JobStatus } from "../../../../config/interface";
import { Web } from "@pnp/sp/presets/all";
import { useReveal } from "../../HomeView/HomeView";
import "../TaskDetailView.css";
import Loader from "../../Loader/Loader";
import { useNavigate } from "react-router-dom";

interface SignatureTabProps {
  job: Job;
}

const SignatureTab: React.FC<SignatureTabProps> = ({ job }) => {
  const navigate = useNavigate();
  const { ref, visible } = useReveal();
  const spWeb = Web("https://chandrudemo.sharepoint.com/sites/FieldService");
  const isSignatureEnabled = job.status === JobStatus.IN_PROGRESS;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isLoader, setIsLoader] = useState(false);
  const toast = useRef<Toast>(null);

  const startDrawing = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    if (!isSignatureEnabled) return;
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    canvasRef.current?.getContext("2d")?.beginPath();
  };

  const draw = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    if (!isDrawing || !isSignatureEnabled) return;
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX: number, clientY: number;

    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#242424";

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const isCanvasEmpty = () => {
    const canvas = canvasRef.current;
    if (!canvas) return true;

    const blank = document.createElement("canvas");
    blank.width = canvas.width;
    blank.height = canvas.height;

    return canvas.toDataURL() === blank.toDataURL();
  };

  const getSignatureBlob = async (): Promise<Blob | null> => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, "image/png");
    });
  };

  const ensureFolder = async (path: string) => {
    try {
      await spWeb.folders.addUsingPath(path);
    } catch {
      console.log("Folder exists");
    }
  };

  const completeJob = async () => {
    try {
      if (isCanvasEmpty()) {
        // alert("Please provide a signature before completing the job.");
        toast.current?.show({
          severity: "warn",
          summary: "Warning",
          detail: "Please provide a signature before completing the job.",
          life: 900000,
        });
        return;
      }

      setIsLoader(true);
      const signatureBlob = await getSignatureBlob();
      if (!signatureBlob) return;

      const jobFolder = `J000${job.id}`;
      const fileName = `${job.id}_signature.png`;
      const library = "JobAttachments";

      // Ensure folder exists
      await ensureFolder(`${library}/${jobFolder}`);
      // await spWeb.folders.addUsingPath(`${library}/${jobFolder}`);

      const user = spWeb.currentUser.get();

      // Upload file
      await spWeb
        .getFolderByServerRelativePath(`${library}/${jobFolder}`)
        .files.addUsingPath(fileName, signatureBlob, { Overwrite: true });

      // Update Job Status in SharePoint List
      await spWeb.lists.getByTitle("Jobs").items.getById(job.id).update({
        Status: "Completed",
        EndDate: new Date(),
      });

      await spWeb.lists.getByTitle("Activities").items.add({
        Title: "Job Completed",
        Description: `${jobFolder} has been Completed by ${(await user).Title}`,
        JobId: Number(job.id),
      });

      // alert("Job completed successfully!");
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Job completed successfully!",
        life: 3000,
      });
      setIsLoader(false);
      navigate(`/jobs`);
    } catch (error) {
      console.error("Error completing job", error);
    }
  };

  return isLoader ? (
    <Loader />
  ) : (
    <>
      <Toast ref={toast} />
      <div
        ref={ref}
        className={`reveal ${visible ? "revealVisible" : ""} signature-tab`}
      >
        <div className="signature-card">
          <h3 className="signature-title">Customer Confirmation</h3>
          <div className="canvas-container">
            {job.status === JobStatus.COMPLETED && job.signatureUrl ? (
              <div className="signature-preview">
                <img
                  src={job.signatureUrl}
                  alt="Customer Signature"
                  className="signature-image"
                />
              </div>
            ) : (
              <canvas
                ref={canvasRef}
                width={400}
                height={200}
                className="signature-canvas"
                style={{
                  pointerEvents: isSignatureEnabled ? "auto" : "none",
                  opacity: isSignatureEnabled ? 1 : 0.5,
                }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
            )}
            <div className="canvas-overlay">
              <div className="signature-line"></div>
              <span className="signature-placeholder">X Sign Above</span>
            </div>
            <button onClick={clear} className="clear-canvas-btn">
              <X size={16} />
            </button>
          </div>

          <p className="signature-disclaimer">
            By signing, you confirm that the service was performed to your
            satisfaction and according to company policy.
          </p>
        </div>

        {job.status === JobStatus.IN_PROGRESS && (
          <div className="signature-actions">
            <button onClick={clear} className="reset-btn">
              Reset Pad
            </button>
            <button className="confirm-btn" onClick={completeJob} type="submit">
              Complete Job
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default React.memo(SignatureTab);
