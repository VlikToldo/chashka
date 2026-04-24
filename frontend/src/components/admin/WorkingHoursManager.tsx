import { useState, useEffect } from "react";
import { Plus, Trash2, Save, Check } from "lucide-react";
import { adminService } from "../../services/adminService";
import { useLanguage } from "../../context/LanguageContext";
import { useVenue } from "../../context/VenueContext";
import { useToast } from "../../context/ToastContext";
import Loader from "../ui/Loader";
import Button from "../ui/Button";
import SectionTitle from "../ui/SectionTitle";
import ConfirmModal from "../ui/ConfirmModal";
import PlacesAutocompleteInput from "./PlacesAutocompleteInput";
import {
  type TimeSlot,
  type DayKey,
  ALL_DAYS,
  type VenueInfo,
} from "../../types/admin";

const genId = () => crypto.randomUUID();

const DEFAULT_SLOTS: TimeSlot[] = [
  {
    id: genId(),
    days: ["mon", "tue", "wed", "thu", "fri"],
    openTime: "08:00",
    closeTime: "18:00",
  },
  { id: genId(), days: ["sat", "sun"], openTime: "09:00", closeTime: "19:00" },
];

const inputClass =
  "w-full bg-transparent border-b border-border py-2 text-sm outline-none focus:border-foreground transition-colors";
const labelClass = "text-xs tracking-wide uppercase text-muted-foreground";

export default function WorkingHoursManager() {
  const { showToast } = useToast();
  const { t } = useLanguage();
  const a = t.admin.hours;
  const c = t.admin.common;
  const dayLabels = t.admin.days;
  const { refresh: refreshVenue } = useVenue();

  // Venue state
  const [venue, setVenue] = useState<VenueInfo>({
    address: { uk: "", en: "", es: "" },
    phone: "",
  });
  const [addressInput, setAddressInput] = useState("");
  const [savingVenue, setSavingVenue] = useState(false);
  const [savedVenue, setSavedVenue] = useState(false);
  const [venueError, setVenueError] = useState<string | null>(null);

  // Hours state
  const [slots, setSlots] = useState<TimeSlot[]>(DEFAULT_SLOTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmSlotId, setConfirmSlotId] = useState<string | null>(null);

  useEffect(() => {
    Promise.allSettled([
      adminService.getVenue(),
      adminService.getWorkingHours(),
    ])
      .then(([venResult, hoursResult]) => {
        if (venResult.status === "fulfilled") {
          setVenue(venResult.value);
          setAddressInput(
            venResult.value.address.en ||
              venResult.value.address.uk ||
              venResult.value.address.es ||
              "",
          );
        }
        if (
          hoursResult.status === "fulfilled" &&
          hoursResult.value.slots.length > 0
        ) {
          setSlots(hoursResult.value.slots);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSaveVenue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressInput.trim()) {
      setVenueError(c.errorSave);
      return;
    }
    setSavingVenue(true);
    setVenueError(null);
    try {
      const updated = await adminService.updateVenue({
        address: addressInput as unknown as VenueInfo["address"],
        phone: venue.phone,
      });
      setVenue(updated);
      refreshVenue();
      setSavedVenue(true);
      setTimeout(() => setSavedVenue(false), 2500);
      showToast(c.saved, "success");
    } catch {
      setVenueError(c.errorSave);
    } finally {
      setSavingVenue(false);
    }
  };

  const addSlot = () =>
    setSlots((prev) => [
      ...prev,
      { id: genId(), days: [], openTime: "09:00", closeTime: "18:00" },
    ]);

  const removeSlot = (id: string) =>
    setSlots((prev) => prev.filter((s) => s.id !== id));

  const updateSlot = (id: string, patch: Partial<TimeSlot>) =>
    setSlots((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const toggleDay = (slotId: string, day: DayKey) => {
    setSlots((prev) =>
      prev.map((s) => {
        if (s.id !== slotId) return s;
        const days = s.days.includes(day)
          ? s.days.filter((d) => d !== day)
          : [...s.days, day];
        return { ...s, days };
      }),
    );
  };

  const handleSaveHours = async () => {
    setSaving(true);
    setError(null);
    try {
      await adminService.updateWorkingHours(slots);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError(c.errorSave);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-12 max-w-2xl">
      {/* Venue section */}
      <form onSubmit={handleSaveVenue} className="space-y-4">
        <SectionTitle>{a.venueTitle}</SectionTitle>

        <div className="space-y-1">
          <label className={labelClass}>{a.address}</label>
          <PlacesAutocompleteInput
            value={addressInput}
            onChange={setAddressInput}
            className={inputClass}
            placeholder="Sant Bartolomé 122, El Campello"
          />
        </div>
        <div className="space-y-1">
          <label className={labelClass}>{a.phone}</label>
          <input
            value={venue.phone}
            onChange={(e) => setVenue((v) => ({ ...v, phone: e.target.value }))}
            className={inputClass}
            placeholder="+34 600 000 000"
          />
        </div>

        {venueError && <p className="text-sm text-red-500">{venueError}</p>}

        <Button type="submit" disabled={savingVenue} className="px-5 py-2">
          {savedVenue ? <Check size={14} /> : <Save size={14} />}
          {savingVenue ? c.saving : savedVenue ? c.saved : a.saveVenueBtn}
        </Button>
      </form>

      {/* Working hours section */}
      <div className="space-y-6">
        <SectionTitle>{a.hoursTitle}</SectionTitle>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="space-y-4">
          {slots.map((slot, idx) => (
            <div
              key={slot.id}
              className="border border-border/50 p-4 space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs tracking-wide uppercase text-muted-foreground">
                  {a.slot} {idx + 1}
                </span>
                <Button
                  variant="ghost-danger"
                  onClick={() => setConfirmSlotId(slot.id)}
                >
                  <Trash2 size={14} />
                </Button>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">
                  {a.days}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_DAYS.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(slot.id, day)}
                      className={`px-2.5 py-1 text-xs transition-colors ${
                        slot.days.includes(day)
                          ? "bg-foreground text-background"
                          : "border border-border text-muted-foreground hover:border-foreground"
                      }`}
                    >
                      {dayLabels[day]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">
                    {a.open}
                  </label>
                  <input
                    type="time"
                    value={slot.openTime}
                    onChange={(e) =>
                      updateSlot(slot.id, { openTime: e.target.value })
                    }
                    className="bg-transparent border-b border-border py-1 text-sm outline-none focus:border-foreground transition-colors"
                  />
                </div>
                <span className="text-muted-foreground text-sm mt-4">–</span>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">
                    {a.close}
                  </label>
                  <input
                    type="time"
                    value={slot.closeTime}
                    onChange={(e) =>
                      updateSlot(slot.id, { closeTime: e.target.value })
                    }
                    className="bg-transparent border-b border-border py-1 text-sm outline-none focus:border-foreground transition-colors"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={addSlot}
          className="flex items-center gap-1.5 text-xs tracking-wide uppercase text-muted-foreground border-b border-border/50 pb-0.5 hover:text-foreground hover:border-foreground transition-colors"
        >
          <Plus size={13} />
          {a.addSlot}
        </button>

        <Button
          onClick={handleSaveHours}
          disabled={saving}
          className="px-6 py-2.5"
        >
          <Save size={14} />
          {saving ? c.saving : saved ? c.saved : a.saveBtn}
        </Button>
      </div>

      <ConfirmModal
        isOpen={!!confirmSlotId}
        message={c.confirmDelete}
        confirmLabel={c.delete ?? "Видалити"}
        cancelLabel={c.cancel}
        onConfirm={() => {
          if (confirmSlotId) {
            removeSlot(confirmSlotId);
            setConfirmSlotId(null);
          }
        }}
        onCancel={() => setConfirmSlotId(null)}
      />
    </div>
  );
}
