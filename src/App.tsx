import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Landing from "./pages/Landing";
import Live from "./pages/Live";
import Dashboard from "./pages/admin/Dashboard";
import WebinarForm from "./pages/admin/WebinarForm";
import ScheduledComments from "./pages/admin/ScheduledComments";
import Offers from "./pages/admin/Offers";
import Registrations from "./pages/admin/Registrations";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/webinar/:webinarId" element={<Landing />} />
            <Route path="/live/:webinarId" element={<Live />} />
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/webinars/new" element={<WebinarForm />} />
            <Route path="/admin/webinars/:id" element={<WebinarForm />} />
            <Route path="/admin/comments" element={<ScheduledComments />} />
            <Route path="/admin/offers" element={<Offers />} />
            <Route path="/admin/registrations" element={<Registrations />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
