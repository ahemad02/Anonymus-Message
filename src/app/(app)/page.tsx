"use client";

import * as React from "react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import messages from "@/messages.json";
import Autoplay from "embla-carousel-autoplay";

function page() {
  return (
    <>
      <main className="flex-grow flex flex-col items-center justify-center px-4 md:px-24 py-12 bg-gray-700 min-h-screen">
        <section className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-5xl  text-purple-500">
            Dive into the world of Mystery Messages
          </h1>
          <p className="mt-3 md:mt-4 text-base md:text-lg text-white italic">
            Mystery Messages is a place where you can send anonymous messages to
            people you don't know.
          </p>
        </section>
        <Carousel
          plugins={[Autoplay({ delay: 2000 })]}
          className="w-full max-w-xs"
        >
          <CarouselContent>
            {messages.map((message, index) => (
              <CarouselItem key={index}>
                <div className="p-1">
                  <Card>
                    <CardHeader>{message.title}</CardHeader>
                    <CardContent className="flex  items-center justify-center p-6">
                      <span className="text-lg font-semibold">
                        {message.content}
                      </span>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </main>
      <footer className="text-center p-4 md:p-6 bg-green-700">
        @2025 Mystery Messages. All rights reserved.
      </footer>
    </>
  );
}

export default page;
