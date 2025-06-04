"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useCurrentCardFileStore } from "./card-display";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useState } from "react";
import "./CardDisplay.css";

export function CardDisplay() {
  const { currentCard } = useCurrentCardFileStore();
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="h-full w-3/5 rounded bg-gray-600/30">
      {currentCard && (
        <main className="flex min-h-3/5 flex-col items-center gap-5 bg-gray-900 p-20">
          {currentCard.cards.length === 0 && (
            <h1 className="text-3xl italic">No cards here...</h1>
          )}
          <Carousel className="w-8/9">
            <CarouselContent>
              {currentCard.cards.map((card) => (
                <CarouselItem key={card.id}>
                  <Card
                    className={`aspect-video bg-gray-400 text-xl text-gray-900 ${isFlipped ? "flipped" : "unflipped"}`}
                    onClick={() => setIsFlipped(!isFlipped)}
                  >
                    <CardContent
                      className={`card-front flex h-full min-h-70 items-center justify-center ${isFlipped ? "hidden" : ""}`}
                    >
                      <pre className="font-sans text-pretty">{card.front}</pre>
                    </CardContent>
                  </Card>
                  <Card
                    className={`aspect-video bg-gray-400 text-xl text-gray-900 ${isFlipped ? "unflipped" : "flipped"}`}
                    onClick={() => setIsFlipped(!isFlipped)}
                  >
                    <CardContent
                      className={`card-back flex h-full min-h-70 items-center justify-center ${isFlipped ? "" : "hidden"}`}
                    >
                      <pre className="font-sans text-pretty">{card.back}</pre>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            {currentCard.cards.length > 1 && (
              <>
                <CarouselPrevious />
                <CarouselNext />
              </>
            )}
          </Carousel>
        </main>
      )}
    </div>
  );
}
