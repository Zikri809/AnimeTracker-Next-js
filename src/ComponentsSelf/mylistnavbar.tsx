"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, User, Download } from "lucide-react";
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useCurrentRoute } from '@/hooks/use-current-route';
import { parseCookies } from "nookies";
import Mylist_sort from "./sort/mylist_sort";
import About_card from "./About/about_card";

interface MyListNavbarProps {
  Setcompleted: (val: any) => void;
  Setplan: (val: any) => void;
  Setwatching: (val: any) => void;
  Setonhold: (val: any) => void;
  Setdropped: (val: any) => void;
  SetpageArr: (val: any) => void;
  isLoading: boolean;
}

export default function MyListNavbar({
  Setcompleted,
  Setplan,
  Setwatching,
  Setonhold,
  Setdropped,
  SetpageArr,
  isLoading,
}: MyListNavbarProps) {
  const [dialogtype, Set_dialogtype] = useState<string>();
  const [entries, Set_entries] = useState<number>();
  const [last_modified, Set_lastmodified] = useState<string>();
  const [animearr, Setanimearr] = useState<any>();
  const [cookies, setCookies] = useState<Record<string, string>>({});
  const inputref = useRef<HTMLInputElement>(null);
  const { push, hardReload } = useCurrentRoute();

  useEffect(() => {
    Promise.resolve().then(() => {
      setCookies(parseCookies({}));
    });
  }, []);

  function backup() {
    try {
      const plantowatch = JSON.parse(localStorage.getItem('PlanToWatch') || '[]');
      const watching = JSON.parse(localStorage.getItem('Watching') || '[]');
      const completed = JSON.parse(localStorage.getItem('Completed') || '[]');
      const onhold = JSON.parse(localStorage.getItem('OnHold') || '[]');
      const dropped = JSON.parse(localStorage.getItem('Dropped') || '[]');
      const watchlistarr = [plantowatch, watching, completed, onhold, dropped];
      console.log('backup clicked');
      const downloadable = JSON.stringify(watchlistarr, null, 2);
      const blob = new Blob([downloadable], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = "watchlist-backup.json";
      a.click();
      toast.success('Watchlist Downloading');
    } catch (e) {
      toast.error('Failed to create backup file');
    }
  }

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
      console.log('data restored');
      setTimeout(() => {
        hardReload();
      }, 1500);
    } catch {
      toast.error('File content cannot be parsed. This file may have been tampered');
    }
  }

  async function log_out() {
    try {
      push('/api/users/auth/log_out');
    } catch (error) {
      console.log('error on log out function');
      push('/mylist/login_failed');
    }
  }

  function handleReset() {
    sessionStorage.removeItem('sort_type');
    sessionStorage.removeItem('sorted_anime');
  }

  return (
    <nav className="fixed w-screen z-3 border-0 bg-black py-4 h-20 px-4 mb-3 top-0 left-0 flex flex-row items-center justify-between">
      <div className="flex items-center gap-5">
        <Link onClick={handleReset} href="/">
          <Button className="bg-zinc-800 text-white hover:text-black hover:bg-zinc-400" variant="secondary" size="icon">
            <ChevronLeft />
          </Button>
        </Link>
        <p className="line-clamp-1 overflow-hidden text-ellipsis text-2xl text-white font-bold text-center">Mylist</p>
      </div>
      <div className="flex flex-row items-center gap-3">
        <Mylist_sort
          Setcompleted={Setcompleted}
          Setplan={Setplan}
          Setwatching={Setwatching}
          Setonhold={Setonhold}
          Setdropped={Setdropped}
          SetpageArr={SetpageArr}
          isLoading={isLoading}
        />
        <Dialog>
          <DropdownMenu>
            <DropdownMenuTrigger className="hover:text-white hover:bg-black hover:border-neutral-300 hover:border-1 text-black w-9 h-9 rounded-md flex flex-row items-center justify-center bg-white border-1 border-white outline-none ring-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0">
              <User size={24} />
            </DropdownMenuTrigger>

            <DropdownMenuContent side="left" align="start" className="text-xl backdrop-blur-md bg-white/20 border rounded-md shadow-lg text-white border-neutral-600">
              <DropdownMenuLabel>{cookies.expires_in ? 'My Account' : 'Local Account'}</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-neutral-400" />
              {!cookies.expires_in && (
                <DropdownMenuItem className="focus:bg-neutral-600 focus:text-white" asChild>
                  <Link href="/mylist/login">Log In</Link>
                </DropdownMenuItem>
              )}
              {!cookies.expires_in && (
                <DialogTrigger asChild>
                  <DropdownMenuItem onClick={() => { Set_dialogtype('backup'); }} className="focus:bg-neutral-600 focus:text-white">Backup</DropdownMenuItem>
                </DialogTrigger>
              )}
              {!cookies.expires_in && (
                <DialogTrigger asChild>
                  <DropdownMenuItem onClick={() => { Set_dialogtype('restore'); }} className="focus:bg-neutral-600 focus:text-white">Restore</DropdownMenuItem>
                </DialogTrigger>
              )}
              {cookies.expires_in && (
                <DropdownMenuItem className="text-white focus:text-white focus:bg-neutral-600" asChild>
                  <Link href="/mylist/user_profile">User Profile</Link>
                </DropdownMenuItem>
              )}
              <DialogTrigger asChild>
                <DropdownMenuItem onClick={() => { Set_dialogtype('about'); }} className="focus:bg-neutral-600 focus:text-white">About Dev</DropdownMenuItem>
              </DialogTrigger>
              {cookies.expires_in && (
                <DropdownMenuItem onClick={log_out} className="text-red-600 focus:text-red-400 focus:bg-neutral-600">Log Out</DropdownMenuItem>
              )}
            </DropdownMenuContent>

            <DialogContent className="border-neutral-800">
              {dialogtype === 'backup' && (
                <>
                  <DialogHeader>
                    <DialogTitle>Download Watchlist Backup?</DialogTitle>
                    <DialogDescription>
                      A file containing your watchlist will be downloaded to your device. Do not tamper with this file, and be sure to follow the restoration instructions.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <div className="relative right-0 flex flex-row w-auto gap-2 justify-end">
                      <Button onClick={backup} className="outline-none ring-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-emerald-700 border-none hover:bg-emerald-500">
                        <Download />Download
                      </Button>
                    </div>
                  </DialogFooter>
                </>
              )}
              {dialogtype === 'restore' && (
                <>
                  <DialogHeader className="text-white text-xl text-justify w-full font-bold border-0">Restore Your Anime World</DialogHeader>
                  <div className="border-0">
                    <p className="mt-1 text-sm text-neutral-500 text-left">
                      Upload your saved data file to continue tracking your favourite anime.
                    </p>
                    <Input onChange={Filereader} ref={inputref} className="my-3 bg-black text-sm text-neutral-500 border-neutral-700 rounded-sm" type="file" />
                    <Button onClick={submitrestore} className="mb-2 w-full hover:bg-neutral-600 bg-neutral-700 border-neutral-700">Restore Now</Button>
                    <ul className="list-disc list-inside w-full text-neutral-500 text-sm">
                      <li>{entries === undefined ? 'NA' : entries} anime entries</li>
                      <li>Last modified: {last_modified === undefined ? 'NA' : last_modified}</li>
                    </ul>
                  </div>
                </>
              )}
              {dialogtype === 'about' && (
                <>
                  <DialogHeader className="text-white text-xl">About AniJikan</DialogHeader>
                  <About_card />
                </>
              )}
            </DialogContent>
          </DropdownMenu>
        </Dialog>
      </div>
    </nav>
  );
}
