"use client";

import { ChangeEvent, useMemo, useRef, useState } from "react";
import { uploadMedia } from "../../../lib/upload-client";
import { useToast } from "../../components/ToastProvider";
import { useRouter } from "next/navigation";
import { MemberContent } from "../../../lib/types";
import { DeleteIcon } from "../../components/DeleteIcon";
import { SelectInput } from "../../../components/SelectInput";

type MemberState = {
  name: string;
  role: string;
  email?: string;
  photo: string;
  isActive: boolean;
};

export const JOB_ROLES = [
  "Clients and Communications Manager",
  "Executive Assistant",
  "Videographer",
  "Creative Director",
  "Software Engineer",
  "Lead Specialist",
  "Social Media Manager",
  "Graphic Designer",
  "Administrative Assistant",
  "Marketing Intern",
  "Managing Director",
  "Marketing and Sales Intern",
  "Clients & Product Experience Executive",
  "Business Development Manager",
  "Marketing & Operations Intern",
  "Product Manager",
  "Marketing Manager",
  "Chief Executive Office",
];

function fromMember(member: MemberContent | null): MemberState {
  return {
    name: member?.name || "",
    role: member?.role || "",
    email: member?.email || "",
    photo: member?.photo || "",
    isActive: member?.isActive || true,
  };
}

function payloadFromState(state: MemberState, status: MemberContent["status"]) {
  return {
    ...state,
    status,
    images: state.photo,
  };
}

export function TeamMemberEditor({
  initial,
  canDelete,
  canPublish,
}: {
  initial: MemberContent | null;
  canPublish: boolean;
  canDelete: boolean;
}) {
  const router = useRouter();
  const toast = useToast();

  const [saving, setSaving] = useState<"draft" | "published" | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [memberId, setMemberId] = useState(initial?._id || "");
  const [uploadLabel, setUploadLabel] = useState("");

  const [state, setState] = useState<MemberState>(() => fromMember(initial));
  const photoInput = useRef<HTMLInputElement>(null);

  function update<K extends keyof MemberState>(key: K, value: MemberState[K]) {
    setState((current) => ({ ...current, [key]: value }));
  }

  async function save(status: "draft" | "published") {
    setSaving(status);
    const response = await fetch(
      memberId ? `/api/team-members/${memberId}` : "/api/team-members",
      {
        method: memberId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadFromState(state, status)),
      },
    );
    const data = await response.json().catch(() => null);
    setSaving(null);
    if (!response.ok) {
      toast.error(data?.error || "Could not save");
      return;
    }
    toast.success(status === "published" ? "Published" : "Draft saved");
    if (data?.member?._id && data.member._id !== memberId) {
      setMemberId(data.member._id);
      router.replace(`/admin/team-members/add?id=${data.member._id}`);
    }
  }

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    try {
      for (const file of Array.from(files)) {
        let url = await uploadMedia(file, setUploadLabel, true);
        url = "https://" + url;

        update("photo", url);
      }

      setUploadLabel("");
    } catch (err) {
      setUploadLabel("");
      toast.error(err instanceof Error ? err.message : "Upload failed");
    }
  }

  function onFile(event: ChangeEvent<HTMLInputElement>) {
    void handleFiles(event.target.files);
    event.target.value = "";
  }

  const extraHint = useMemo(() => {
    if (uploadLabel) return uploadLabel;
    return "Images are resized to 2560px and saved as WebP before they reach storage.";
  }, [uploadLabel]);

  return (
    <div className="editorPage">
      <header className="editorBar">
        <a href="/admin/team-members">← Team</a>
        <div>
          {memberId && canDelete ? (
            <button
              className="deleteBarBtn"
              onClick={() => setConfirmingDelete(true)}
              disabled={Boolean(saving) || deleting}
              type="button"
              aria-label="Delete post"
            >
              <DeleteIcon />
            </button>
          ) : null}
          <button
            onClick={() => void save("draft")}
            disabled={Boolean(saving) || deleting}
            type="button"
          >
            {saving === "draft" ? "Saving…" : "Save draft"}
          </button>
          {canPublish ? (
            <button
              className="publishBtn"
              onClick={() => void save("published")}
              disabled={Boolean(saving) || deleting}
              type="button"
            >
              {saving === "published" ? "Publishing…" : "Publish"}
            </button>
          ) : null}
        </div>
      </header>
      <main className="editorMain">
        <div className="editorTitle">
          <p className="sectionLabel">
            {memberId ? "Edit team" : "Create team"}
          </p>
          <h1>{memberId ? "Edit team member" : "New team member"}</h1>
        </div>

        <section className="editorSection formGrid">
          <label>Person details</label>
          <div>
            <div className="field">
              <span>Name</span>
              <input
                value={state.name}
                onChange={(event) => update("name", event.target.value)}
              />
            </div>

            <div className="fieldSplit">
              <div className="field">
                <SelectInput
                  list={JOB_ROLES.sort().map((r) => ({ label: r, value: r }))}
                  label="Role"
                  value={state.role}
                  onChangeAction={(value) => update("role", value)}
                />
                {/* <span>Role</span>
                <input
                  value={state.role}
                  onChange={(event) => update("role", event.target.value)}
                /> */}
              </div>
              <div className="field">
                <span>Email</span>
                <input
                  value={state.email}
                  onChange={(event) => update("email", event.target.value)}
                />
              </div>
            </div>

            <div className="field">
              <div className="checkbox">
                <div>
                  <input
                    type="checkbox"
                    name="isActive"
                    id="is_active"
                    checked={state.isActive || false}
                    onChange={(e) => update("isActive", e.target.checked)}
                  />
                  <label htmlFor="is_active">Show team member on website</label>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="editorSection formGrid">
          <label>Featured image</label>
          <div>
            <input
              ref={photoInput}
              className="hiddenFile"
              type="file"
              accept="image/*"
              onChange={(event) => onFile(event)}
            />
            <button
              className="uploadDemo"
              type="button"
              onClick={() => photoInput.current?.click()}
            >
              <span>＋</span>
              <b>{state.photo ? "Replace photo" : "Add photo"}</b>
              <small>{extraHint}</small>
            </button>
            {state.photo ? (
              <div className="mediaPreview">
                <img src={state.photo} alt="Photo" />
                <button type="button" onClick={() => update("photo", "")}>
                  Remove photo
                </button>
              </div>
            ) : null}
          </div>
        </section>
      </main>
      {/* {confirmingDelete && canDelete && (
            <ConfirmDelete
              title={state.title}
              deleting={deleting}
              onCancel={() => {
                if (!deleting) setConfirmingDelete(false);
              }}
              onConfirm={() => void remove()}
            />
          )} */}
    </div>
  );
}
