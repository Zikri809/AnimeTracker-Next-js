"use client";

import React, { useRef, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useCurrentRoute } from "@/hooks/use-current-route";

export default function UploadBackup() {
  const [entries, Set_entries] = useState<number>();
  const [last_modified, Set_lastmodified] = useState<string>();
  const [animearr, Setanimearr] = useState<any>();
  const inputref = useRef<HTMLInputElement>(null);
  const { push } = useCurrentRoute();

  function Filereader(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      console.log('No file selected. Please choose a file');
      return;
    }
    const date = new Date(file.lastModified);
    Set_lastmodified(date.toDateString());

    const isJson = file.type === "application/json" || file.name.endsWith(".json");
    if (!isJson) {
      console.log('Unsupported file type. File must be json');
      toast.error('Unsupported file type. File must be json');
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => {
      console.log("Error reading the file. Please try again.", "error");
    };
    reader.onload = () => {
      try {
        const watchlistarr = JSON.parse(reader.result as string);
        if (Array.isArray(watchlistarr) && watchlistarr.length >= 5) {
          Setanimearr(watchlistarr);
          const totalEntries =
            (watchlistarr[0]?.length || 0) +
            (watchlistarr[1]?.length || 0) +
            (watchlistarr[2]?.length || 0) +
            (watchlistarr[3]?.length || 0) +
            (watchlistarr[4]?.length || 0);
          Set_entries(totalEntries);
        } else {
          toast.error('Invalid backup format');
        }
      } catch {
        toast.error('Problem reading the file');
      }
    };
    reader.readAsText(file);
  }

  function submitrestore() {
    if (animearr === undefined) return;
    try {
      const plantowatcharr = animearr[0] || [];
      const watchingarr = animearr[1] || [];
      const completedarr = animearr[2] || [];
      const onholdarr = animearr[3] || [];
      const droppedarr = animearr[4] || [];

      localStorage.setItem('PlanToWatch', JSON.stringify(plantowatcharr));
      localStorage.setItem('Watching', JSON.stringify(watchingarr));
      localStorage.setItem('Completed', JSON.stringify(completedarr));
      localStorage.setItem('OnHold', JSON.stringify(onholdarr));
      localStorage.setItem('Dropped', JSON.stringify(droppedarr));
      toast.success('Watchlist restored');
      setTimeout(() => {
        push('/mylist');
      }, 1500);
    } catch {
      toast.error('File content cannot be parsed. This file may have been tampered');
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black">
      <Card className="bg-neutral-950 border-neutral-700 w-80 sm:w-100 h-fit p-4">
        <CardContent className="p-1">
          <CardHeader className="text-white text-xl w-full font-bold border-0">Restore Your Anime World</CardHeader>
          <CardContent className="border-0">
            <p className="mt-2 text-sm text-neutral-500 text-left">
              Upload your saved data file to continue tracking your favourite anime.
            </p>
            <Input onChange={Filereader} ref={inputref} className="my-6 bg-black text-sm text-neutral-500 border-neutral-700 rounded-sm" placeholder="no file chosen" type="file" />
            <Button onClick={submitrestore} className="mb-4 w-full hover:bg-neutral-800 bg-neutral-900 border-neutral-700">Restore Now</Button>
            <ul className="list-disc list-inside w-full text-neutral-500 text-sm">
              <li>{entries === undefined ? 'NA' : entries} anime entries</li>
              <li>Last modified: {last_modified === undefined ? 'NA' : last_modified}</li>
            </ul>
          </CardContent>
        </CardContent>
      </Card>
    </div>
  );
}
