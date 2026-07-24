"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSessions } from "@/hooks/useSessions";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { DisclaimerBanner } from "@/components/molecules/DisclaimerBanner";
import { VehicleLabelInput } from "@/components/molecules/VehicleLabelInput";
import { PhotoCapture } from "@/components/organisms/PhotoCapture";

export default function NewSpotPage() {
    const router = useRouter();
    const { saveSpot } = useSessions();

    const [isCapturingPhoto, setIsCapturingPhoto] = useState(false);
    const [vehicleLabel, setVehicleLabel] = useState("My car");
    const [floor, setFloor] = useState("");
    const [bay, setBay] = useState("");
    const [note, setNote] = useState("");
    const [durationMinutes, setDurationMinutes] = useState(120);
    const [customDurationInput, setCustomDurationInput] = useState("");
    const [photoBlob, setPhotoBlob] = useState<Blob | null>(null);
    const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
    const [errors, setErrors] = useState<{ vehicleLabel?: string; form?: string }>({});

    const DURATION_PRESETS = [
        { label: "30m", value: 30 },
        { label: "1h", value: 60 },
        { label: "2h", value: 120 },
        { label: "4h", value: 240 },
        { label: "8h", value: 480 },
    ];

    useEffect(() => {
        if (photoBlob) {
            const url = URL.createObjectURL(photoBlob);
            setPhotoPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setPhotoPreviewUrl(null);
        }
    }, [photoBlob]);

    const handlePresetSelect = (value: number) => {
        setDurationMinutes(value);
        setCustomDurationInput("");
    };

    const handleCustomDurationChange = (val: string) => {
        setCustomDurationInput(val);
        const parsed = parseInt(val, 10);
        if (!isNaN(parsed) && parsed > 0) {
            setDurationMinutes(parsed);
        }
    };

    const handleSaveSpot = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        const newErrors: typeof errors = {};

        if (!vehicleLabel.trim()) {
            newErrors.vehicleLabel = "Vehicle label is required";
        }

        if (!floor.trim() && !bay.trim() && !note.trim() && !photoBlob) {
            newErrors.form = "Please provide at least one detail (Floor, Bay, Note, or Photo) to save your spot.";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        await saveSpot({ vehicleLabel, floor, bay, note, photoBlob, durationMinutes });
        router.push("/");
    };

    if (isCapturingPhoto) {
        return (
            <div className="w-full max-w-md mx-auto">
                <PhotoCapture
                    onPhotoCaptured={(blob) => {
                        setPhotoBlob(blob);
                        setIsCapturingPhoto(false);
                    }}
                    onClose={() => setIsCapturingPhoto(false)}
                />
            </div>
        );
    }

    return (
        <div className="w-full max-w-md mx-auto flex flex-col space-y-6">
            <DisclaimerBanner variant="modal" />

            <Link
                href="/"
                className="flex items-center space-x-1.5 text-sm font-semibold text-neutral-400 hover:text-neutral-200 self-start transition-colors"
            >
                <p>&larr; View Active Parking</p>
            </Link>

            <form
                onSubmit={handleSaveSpot}
                className="p-6 bg-neutral-950 border border-neutral-800 rounded-3xl shadow-2xl flex flex-col space-y-5"
            >
                <div className="flex flex-col space-y-1.5">
                    <h2 className="text-xl font-black text-neutral-100 tracking-tight">Capture Parking Spot</h2>
                    <p className="text-xs text-neutral-400 leading-normal">
                        Record floor, bay number, notes, and snap a picture offline.
                    </p>
                </div>

                {errors.form && (
                    <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold rounded-xl">
                        {errors.form}
                    </div>
                )}

                <VehicleLabelInput
                    value={vehicleLabel}
                    onChange={(val) => setVehicleLabel(val)}
                    error={errors.vehicleLabel}
                />

                <div className="grid grid-cols-2 gap-3">
                    <Input
                        label="Floor Level"
                        placeholder='e.g., "B2", "3"'
                        value={floor}
                        onChange={(e) => setFloor(e.target.value)}
                        maxLength={10}
                    />
                    <Input
                        label="Bay Number"
                        placeholder='e.g., "104", "A12"'
                        value={bay}
                        onChange={(e) => setBay(e.target.value)}
                        maxLength={10}
                    />
                </div>

                <div className="flex flex-col space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                        Spot Photo
                    </label>
                    {photoPreviewUrl ? (
                        <div className="relative rounded-2xl border border-neutral-800 bg-neutral-900 overflow-hidden aspect-[4/3] w-full flex items-center justify-center">
                            <img
                                src={photoPreviewUrl}
                                alt="Spot preview"
                                className="w-full h-full object-cover"
                            />
                            <button
                                type="button"
                                onClick={() => setPhotoBlob(null)}
                                className="absolute bottom-3 right-3 px-3 py-1.5 bg-neutral-950/80 hover:bg-neutral-950 border border-neutral-800 text-xs font-bold text-rose-500 rounded-xl hover:text-rose-400 active:scale-95 transition-all"
                            >
                                Remove Photo
                            </button>
                        </div>
                    ) : (
                        <Button
                            type="button"
                            variant="glass"
                            fullWidth
                            onClick={() => setIsCapturingPhoto(true)}
                            className="py-3 flex items-center justify-center space-x-2 border-dashed"
                        >
                            <svg
                                className="w-5 h-5 text-neutral-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                            </svg>
                            <p className="text-neutral-300 font-semibold text-sm">Take Photo (In-App)</p>
                        </Button>
                    )}
                </div>

                <Input
                    label="Quick Notes"
                    placeholder='e.g., "Parked next to elevator doors"'
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    maxLength={140}
                />

                <div className="flex flex-col space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                        Parking Duration
                    </p>
                    <div className="grid grid-cols-5 gap-1">
                        {DURATION_PRESETS.map((preset) => {
                            const isSelected = durationMinutes === preset.value && !customDurationInput;
                            return (
                                <button
                                    key={preset.value}
                                    type="button"
                                    onClick={() => handlePresetSelect(preset.value)}
                                    className={`py-2 text-xs font-semibold rounded-xl border transition-all duration-300 ${isSelected
                                        ? "bg-orange-500/20 text-orange-500 border-orange-500/50"
                                        : "bg-neutral-900/40 text-neutral-400 border-neutral-800 hover:border-neutral-700/80"
                                        }`}
                                >
                                    {preset.label}
                                </button>
                            );
                        })}
                    </div>
                    <div className="pt-1.5">
                        <Input
                            type="number"
                            min="1"
                            placeholder="Or input custom minutes"
                            value={customDurationInput}
                            onChange={(e) => handleCustomDurationChange(e.target.value)}
                        />
                    </div>
                </div>

                <div className="pt-2">
                    <Button type="submit" variant="primary" fullWidth className="py-3.5 text-sm">
                        Save Spot
                    </Button>
                </div>
            </form>
        </div>
    );
}
