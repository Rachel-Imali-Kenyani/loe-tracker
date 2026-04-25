import { Alert, Button, InputNumber, Select, Switch } from "antd";
import { X } from "lucide-react";
import type { SelectableProject } from ".";

interface TimeLogModalProps {
  isOpen: boolean;
  editingLogId: string | null;
  selectedDate: Date;
  selectedProject: string;
  hours: number | string | null;
  isTimeOff: boolean;
  projects: SelectableProject[];
  saveError: string | null;
  isSaving: boolean;
  onClose: () => void;
  onProjectChange: (value: string) => void;
  onHoursChange: (value: number | string | null) => void;
  onTimeOffChange: (checked: boolean) => void;
  onSave: () => void;
  onDelete: () => void;
}

export function TimeLogModal({
  isOpen,
  editingLogId,
  selectedDate,
  selectedProject,
  hours,
  isTimeOff,
  projects,
  saveError,
  isSaving,
  onClose,
  onProjectChange,
  onHoursChange,
  onTimeOffChange,
  onSave,
  onDelete,
}: TimeLogModalProps) {
  if (!isOpen) return null;

  const dateStr = selectedDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl border border-outline-variant bg-[#080a0f] shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-outline-variant px-6 py-5">
          <div>
            <h3 className="text-lg font-semibold text-on-surface mb-1">
              {editingLogId ? "Edit Time Log" : "Log Time"}
            </h3>
            <p className="text-sm text-on-surface-variant">{dateStr}</p>
          </div>
          <Button
            type="text"
            shape="circle"
            icon={<X size={18} />}
            onClick={onClose}
          />
        </div>

        <div className="px-6 py-5">
          {saveError ? (
            <Alert message={saveError} type="error" showIcon className="mb-5" />
          ) : null}

          <div className="grid gap-5 md:grid-cols-[auto_1fr_auto] md:items-end">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-on-surface">
                Time Off
              </label>
              <Switch
                checked={isTimeOff}
                onChange={onTimeOffChange}
                size="small"
              />
            </div>

            {!isTimeOff && (
              <>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-2">
                    Project
                  </label>
                  <Select
                    value={selectedProject}
                    onChange={onProjectChange}
                    className="w-full"
                    placeholder="Select a project"
                  >
                    {projects.map((project) => (
                      <Select.Option key={project.value} value={project.value}>
                        {project.name}
                      </Select.Option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-on-surface mb-2">
                    Hours
                  </label>
                  <InputNumber
                    value={hours}
                    onChange={onHoursChange}
                    min={0.5}
                    max={8}
                    step={0.5}
                    precision={1}
                    className="w-full"
                    placeholder="Hours"
                  />
                </div>
              </>
            )}

            {isTimeOff && (
              <div className="md:col-span-2">
                <div className="text-sm text-on-surface-variant">
                  Time off entries are automatically set to 8 hours.
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-outline-variant px-6 py-4">
          {editingLogId ? (
            <Button
              danger
              onClick={onDelete}
              loading={isSaving}
              className="mr-auto"
            >
              DELETE
            </Button>
          ) : null}
          <Button onClick={onClose}>CANCEL</Button>
          <Button
            type="primary"
            onClick={onSave}
            loading={isSaving}
            disabled={isTimeOff ? false : !hours || !selectedProject}
          >
            {editingLogId ? "UPDATE" : "LOG TIME"}
          </Button>
        </div>
      </div>
    </div>
  );
}
