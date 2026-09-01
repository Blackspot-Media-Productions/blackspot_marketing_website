export function ConfirmDelete({
  title,
  deleting,
  onCancel,
  onConfirm,
  sectionLabel = "Delete content",
  heading = "Delete this post?",
  copy,
  confirmLabel = "Delete",
  busyLabel = "Deleting…",
}: {
  title: string;
  deleting?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  sectionLabel?: string;
  heading?: string;
  copy?: string;
  confirmLabel?: string;
  busyLabel?: string;
}) {
  return (
    <div className="typeModal" role="dialog" aria-modal="true" aria-labelledby="delete-title">
      <div className="modalCard confirmCard">
        <button className="modalClose" onClick={onCancel} aria-label="Close" type="button" disabled={deleting}>×</button>
        <p className="sectionLabel">{sectionLabel}</p>
        <h2 id="delete-title">{heading}</h2>
        <p className="confirmCopy">{copy || `“${title || "Untitled"}” will be permanently removed. This cannot be undone.`}</p>
        <div className="confirmActions">
          <button type="button" onClick={onCancel} disabled={deleting}>Cancel</button>
          <button type="button" className="dangerBtn" onClick={onConfirm} disabled={deleting}>
            {deleting ? busyLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
