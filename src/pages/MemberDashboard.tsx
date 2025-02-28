/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import BotManagement from "@/components/dashboard/BotManagement";
import { BotDetails } from "@/types/dashboard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Bot, House } from "lucide-react";

const MemberDashboard = () => {
  const [bots, setBots] = useState<BotDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState<string>("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserAndBots = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user?.email) {
          setUsername(user.email.split("@")[0]);
        }

        const { data, error } = await supabase.from("bots").select("*");

        if (error) {
          throw error;
        }

        if (data) {
          const formattedBots: BotDetails[] = data.map((bot) => ({
            id: bot.id,
            name: bot.name,
            machineName: bot.machine_name,
            startTime: bot.start_time,
            endTime: bot.end_time,
            scheduledDays: bot.scheduled_days,
            platform: bot.platform,
          }));
          setBots(formattedBots);
        }
      } catch (error: any) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to fetch data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAndBots();
  }, [toast]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f6f7]/80">
      <nav className="glass fixed top-0 w-full z-50">
        <div className="container mx-auto px-6 py-3">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold flex items-center gap-2">
              <Bot className="h-6 w-6 md:hidden" />
              <span className="hidden md:inline">Bot Control Room</span>
            </h1>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => navigate("/")}
                variant="outline"
                className="bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900 transition-all duration-300"
              >
                <House className="h-4 w-4 md:hidden" />
                <span className="hidden md:inline">Back to Timeline</span>
              </Button>
              <Button
                onClick={handleLogout}
                variant="destructive"
                className="bg-rose-600 hover:bg-rose-700 transition-all duration-300"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden md:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8 mt-16">
        <div className="py-4">
          <h2 className="text-2xl tracking-tight font-light text-slate-800">
            Welcome back,{" "}
            <span className="font-medium italic text-slate-900">
              {username || "User"}
            </span>
          </h2>
          <div className="h-1 w-20 bg-gradient-to-r from-slate-800 to-slate-400 mt-2 rounded-full"></div>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-lg p-8 text-center border border-slate-200">
            <div className="text-lg text-slate-600">Loading bots...</div>
          </div>
        ) : (
          <BotManagement bots={bots} setBots={setBots} />
        )}
      </div>
    </div>
  );
};

export default MemberDashboard;
