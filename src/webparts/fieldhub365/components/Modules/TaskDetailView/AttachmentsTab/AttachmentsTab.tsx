/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import * as React from "react";
import { useEffect, useState, Dispatch, SetStateAction } from "react";
import { ImagePlus, Trash2, Upload } from "lucide-react";
import { Web } from "@pnp/sp/presets/all";
import { Job, JobStatus } from "../../../../config/interface";
import { useReveal } from "../../HomeView/HomeView";

interface PhotoSectionProps {
  title: string;
  photos: File[];
  setPhotos: Dispatch<SetStateAction<File[]>>;
  existingFiles: any[];
  removeExisting: (file: any) => void;
}

interface Props {
  job: Job;
}

const AttachmentsTab: React.FC<Props> = ({ job }) => {
  const { ref, visible } = useReveal();
  const spWeb = Web("https://chandrudemo.sharepoint.com/sites/FieldService");

  const library = "JobAttachments";
  const jobFolder = `J000${job.id}`;

  const [beforePhotos, setBeforePhotos] = useState<File[]>([]);
  const [afterPhotos, setAfterPhotos] = useState<File[]>([]);

  const [existingBeforeFiles, setExistingBeforeFiles] = useState<any[]>([]);
  const [existingAfterFiles, setExistingAfterFiles] = useState<any[]>([]);

  const [deletedFiles, setDeletedFiles] = useState<string[]>([]);

  useEffect(() => {
    loadAttachments();
  }, []);

  const ensureFolder = async (path: string) => {
    try {
      await spWeb.folders.addUsingPath(path);
    } catch {
      console.log("Folder exists");
    }
  };

  const loadAttachments = async () => {
    try {
      const beforePath = `${library}/${jobFolder}/before`;
      const afterPath = `${library}/${jobFolder}/after`;

      const before = await spWeb
        .getFolderByServerRelativePath(beforePath)
        .files();

      const after = await spWeb
        .getFolderByServerRelativePath(afterPath)
        .files();

      setExistingBeforeFiles(before);
      setExistingAfterFiles(after);
    } catch {
      console.log("No attachments found");
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setPhotos: Dispatch<SetStateAction<File[]>>,
  ) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    setPhotos((prev) => [...prev, ...files]);
  };

  const markFileForDelete = (file: any) => {
    setDeletedFiles((prev) => [...prev, file.ServerRelativeUrl]);

    setExistingBeforeFiles((prev) =>
      prev.filter((f) => f.ServerRelativeUrl !== file.ServerRelativeUrl),
    );

    setExistingAfterFiles((prev) =>
      prev.filter((f) => f.ServerRelativeUrl !== file.ServerRelativeUrl),
    );
  };

  const uploadAttachments = async () => {
    try {
      await ensureFolder(`${library}/${jobFolder}`);

      const beforePath = `${library}/${jobFolder}/before`;
      const afterPath = `${library}/${jobFolder}/after`;

      await ensureFolder(beforePath);
      await ensureFolder(afterPath);

      const beforeFolder = spWeb.getFolderByServerRelativePath(beforePath);
      const afterFolder = spWeb.getFolderByServerRelativePath(afterPath);
      for (const file of beforePhotos) {
        await beforeFolder.files.addUsingPath(file.name, file, {
          Overwrite: true,
        });
      }

      for (const file of afterPhotos) {
        await afterFolder.files.addUsingPath(file.name, file, {
          Overwrite: true,
        });
      }

      for (const fileUrl of deletedFiles) {
        await spWeb.getFileByServerRelativePath(fileUrl).delete();
      }

      alert("Attachments updated successfully");

      setBeforePhotos([]);
      setAfterPhotos([]);
      setDeletedFiles([]);

      loadAttachments();
    } catch (err) {
      console.error("Upload error", err);
    }
  };

  const discardChanges = () => {
    setBeforePhotos([]);
    setAfterPhotos([]);
    setDeletedFiles([]);
    loadAttachments();
  };

  const PhotoSection: React.FC<PhotoSectionProps> = ({
    title,
    photos,
    setPhotos,
    existingFiles,
    removeExisting,
  }) => (
    <div className="photo-section">
      <div className="photo-header">
        <h3 className="photo-title">{title} Photos</h3>
        <span className="photo-count">
          {photos.length + existingFiles.length} Uploaded
        </span>
      </div>

      <div className="photo-grid">
        {/* Existing SharePoint Images */}
        {existingFiles.map((file, i) => (
          <div key={i} className="photo-item">
            <img src={file.ServerRelativeUrl} className="photo-image" />
            <button
              onClick={() => removeExisting(file)}
              className="delete-photo-btn"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}

        {/* New Uploaded Images */}
        {photos.map((p, i) => (
          <div key={i} className="photo-item">
            <img src={URL.createObjectURL(p)} className="photo-image" />
            <button
              onClick={() => setPhotos(photos.filter((_, idx) => idx !== i))}
              className="delete-photo-btn"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}

        <input
          type="file"
          multiple
          accept="image/*"
          style={{ display: "none" }}
          id={`${title}-upload`}
          onChange={(e) => handleFileChange(e, setPhotos)}
        />

        {job.status === JobStatus.IN_PROGRESS && (
          <label htmlFor={`${title}-upload`} className="add-photo-btn">
            <ImagePlus size={20} />
            <span>Upload</span>
          </label>
        )}
      </div>
    </div>
  );

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? "revealVisible" : ""} attachments-tab`}
    >
      <PhotoSection
        title="Before"
        photos={beforePhotos}
        setPhotos={setBeforePhotos}
        existingFiles={existingBeforeFiles}
        removeExisting={markFileForDelete}
      />

      <PhotoSection
        title="After"
        photos={afterPhotos}
        setPhotos={setAfterPhotos}
        existingFiles={existingAfterFiles}
        removeExisting={markFileForDelete}
      />

      {job.status === JobStatus.IN_PROGRESS && (
        <div className="action-buttons">
          <button className="cancel-btn" onClick={discardChanges}>
            Cancel
          </button>

          <button className="submit-btn" onClick={uploadAttachments}>
            <Upload size={14} /> Submit Media
          </button>
        </div>
      )}
    </div>
  );
};

export default React.memo(AttachmentsTab);
