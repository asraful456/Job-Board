"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { apiErrorMessage } from "@/lib/data";
import type { User } from "@/types";
import DataTable, { type Column } from "@/components/DataTable";
import { Button, EmptyState, ErrorState, Input, Modal, Select, Skeleton } from "@/components/ui";

type MemberDraft = { name: string; email: string; password: string; role: "screener" | "hr" };

export default function CompanyTeamPage() {
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [removing, setRemoving] = useState<User | null>(null);
  const [draft, setDraft] = useState<MemberDraft>({ name: "", email: "", password: "", role: "screener" });
  const [saving, setSaving] = useState(false);

  const loadMembers = useCallback(async () => {
    try {
      const { data } = await api.get<User[]>("/company/team");
      setMembers(data);
      setError(false);
    } catch (requestError) {
      setError(true);
      toast.error(apiErrorMessage(requestError, "Could not load team members."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => void loadMembers(), 0);
    return () => window.clearTimeout(timeout);
  }, [loadMembers]);

  const addMember = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      await api.post("/company/team", draft);
      toast.success(`${draft.role === "hr" ? "HR" : "Screener"} account added.`);
      setModalOpen(false);
      setDraft({ name: "", email: "", password: "", role: "screener" });
      await loadMembers();
    } catch (requestError) {
      toast.error(apiErrorMessage(requestError, "Could not add this team member."));
    } finally {
      setSaving(false);
    }
  };

  const removeMember = async () => {
    if (!removing) return;
    setSaving(true);
    try {
      await api.delete(`/company/team/${removing.id}`);
      toast.success("Team member removed.");
      setRemoving(null);
      await loadMembers();
    } catch (requestError) {
      toast.error(apiErrorMessage(requestError, "Could not remove this team member."));
    } finally {
      setSaving(false);
    }
  };

  const columns: Column<User>[] = [
    { key: "name", header: "Name", render: (member) => <span className="font-medium text-gray-900">{member.name}</span> },
    { key: "email", header: "Email", render: (member) => member.email },
    {
      key: "role",
      header: "Role",
      render: (member) => (
        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium capitalize text-blue-700">
          {member.role}
        </span>
      ),
    },
    {
      key: "action",
      header: "Action",
      render: (member) => (
        <button onClick={() => setRemoving(member)} className="font-medium text-red-600 hover:text-red-700">
          Remove
        </button>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Team Members</h1>
          <p className="mt-1 text-sm text-gray-500">Manage the people helping with your hiring.</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>+ Add member</Button>
      </div>
      {loading ? <Skeleton rows={3} /> : error ? <ErrorState onRetry={() => void loadMembers()} /> : members.length ? (
        <DataTable rows={members} columns={columns} />
      ) : (
        <EmptyState title="No team members yet" description="Invite screeners and HR teammates to help hire." action={<Button onClick={() => setModalOpen(true)}>Add member</Button>} />
      )}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add team member">
        <form className="space-y-4" onSubmit={(event) => void addMember(event)}>
          <Input label="Name" required value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
          <Input label="Email" type="email" required value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} />
          <Input label="Temporary password" type="password" minLength={8} required value={draft.password} onChange={(event) => setDraft({ ...draft, password: event.target.value })} />
          <Select label="Role" value={draft.role} onChange={(event) => setDraft({ ...draft, role: event.target.value as MemberDraft["role"] })}>
            <option value="screener">Screener</option>
            <option value="hr">HR</option>
          </Select>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Adding..." : "Add member"}</Button>
          </div>
        </form>
      </Modal>
      <Modal open={Boolean(removing)} onClose={() => setRemoving(null)} title="Remove team member?">
        <p className="text-sm text-gray-600">
          Remove {removing?.name} from your company team? They will lose access to the company workspace.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setRemoving(null)}>Cancel</Button>
          <Button variant="danger" onClick={() => void removeMember()} disabled={saving}>
            {saving ? "Removing..." : "Remove member"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
