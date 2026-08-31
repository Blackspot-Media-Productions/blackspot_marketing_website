export function ConfirmDelete({
  title,
  deleting,
  onCancel,
  onConfirm,
}: {
  title: string;
  deleting?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="typeModal" role="dialog" aria-modal="true" aria-labelledby="delete-title">
      <div className="modalCard confirmCard">
        <button className="modalClose" onClick={onCancel} aria-label="Close" type="button" disabled={deleting}>×</button>
        <p className="sectionLabel">Delete content</p>
        <h2 id="delete-title">Delete this post?</h2>
        <p className="confirmCopy">“{title || "Untitled"}” will be permanently removed. This cannot be undone.</p>
        <div className="confirmActions">
          <button type="button" onClick={onCancel} disabled={deleting}>Cancel</button>
          <button type="button" className="dangerBtn" onClick={onConfirm} disabled={deleting}>
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
