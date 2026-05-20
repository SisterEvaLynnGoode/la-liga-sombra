"use client";

import Cutscene from "@/components/games/Cutscene";
import type { CutsceneStageData } from "@/lib/types/unit-content";
import type { GameResult } from "@/lib/games/types";

interface Props extends CutsceneStageData {
  onComplete: (result: GameResult) => void;
}

export default function CutsceneStage({
  videoUrl, subtitleUrl, fallbackImage, chiefName, chiefImageSeed, chiefImageUrl,
  briefingLines, onComplete,
}: Props) {
  return (
    <Cutscene
      videoUrl={videoUrl}
      subtitleUrl={subtitleUrl}
      fallbackImage={fallbackImage}
      chiefName={chiefName}
      chiefImageSeed={chiefImageSeed}
      chiefImageUrl={chiefImageUrl}
      briefingLines={briefingLines}
      onComplete={onComplete}
    />
  );
}
