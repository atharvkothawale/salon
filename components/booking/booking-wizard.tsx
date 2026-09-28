"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { BookingProgress } from "./booking-progress";
import { ServiceSelection } from "./service-selection";
import { StaffSelection } from "./staff-selection";
import { DateSelection } from "./date-selection";
import { TimeSlotSelection } from "./time-slot-selection";
import { CustomerDetails } from "./customer-details";
import { BookingSummary } from "./booking-summary";
import { BookingReview } from "./booking-review";

interface Category {
  id: string;
  name: string;
}

interface Service {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  duration_minutes: number;
  image_url: string | null;
  service_categories?: { name: string } | null;
}

interface StaffMember {
  id: string;
  full_name: string;
  role_title: string;
  bio: string | null;
  photo_url: string | null;
  staff_services?: Array<{
    services: { id: string; name: string } | null;
  }>;
}

interface CustomerProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
}

interface BookingWizardProps {
  categories: Category[];
  services: Service[];
  staffList: StaffMember[];
  userProfile: CustomerProfile | null;
}

export function BookingWizard({
  categories,
  services,
  staffList,
  userProfile,
}: BookingWizardProps) {
  const searchParams = useSearchParams();

  // Derive initial values directly from query params
  const paramServiceId = searchParams.get("serviceId") || searchParams.get("service");
  const paramStaffId = searchParams.get("staffId") || searchParams.get("staff");

  const initialService = paramServiceId ? services.find((s) => s.id === paramServiceId) || null : null;
  const initialStaff = paramStaffId ? staffList.find((s) => s.id === paramStaffId) || null : null;

  // Booking State
  const [currentStep, setCurrentStep] = useState<number>(initialService ? 2 : 1);
  const [selectedService, setSelectedService] = useState<Service | null>(initialService);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(initialStaff?.id || null);
  const [selectedStaffName, setSelectedStaffName] = useState<string>(
    initialStaff?.full_name || "Any Available Stylist"
  );
  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{
    time: string;
    displayTime: string;
    startTimeIso: string;
    endTimeIso: string;
    assignedStaffId?: string;
  } | null>(null);

  // Customer Form State
  const [customerName, setCustomerName] = useState<string>(
    userProfile?.full_name || ""
  );
  const [customerEmail, setCustomerEmail] = useState<string>(
    userProfile?.email || ""
  );
  const [customerPhone, setCustomerPhone] = useState<string>(
    userProfile?.phone || ""
  );
  const [notes, setNotes] = useState<string>("");

  // Qualified staff for current service
  const qualifiedStaff = selectedService
    ? staffList.filter((st) =>
        st.staff_services?.some(
          (ss) => ss.services?.id === selectedService.id || ss.services?.name === selectedService.name
        )
      )
    : staffList;

  // Handlers
  const handleSelectService = (service: Service) => {
    setSelectedService(service);

    // Reset staff if current selected staff is not qualified
    if (selectedStaffId) {
      const isStillQualified = staffList.some(
        (st) =>
          st.id === selectedStaffId &&
          st.staff_services?.some(
            (ss) => ss.services?.id === service.id || ss.services?.name === service.name
          )
      );
      if (!isStillQualified) {
        setSelectedStaffId(null);
        setSelectedStaffName("Any Available Stylist");
      }
    }

    // Reset time slot when service changes
    setSelectedTimeSlot(null);
    setCurrentStep(2); // Automatically advance to Stylist step
  };

  const handleSelectStaff = (staffId: string | null, staffName: string) => {
    setSelectedStaffId(staffId);
    setSelectedStaffName(staffName);
    setSelectedTimeSlot(null); // Reset time slot when staff changes
  };

  const handleSelectDate = (dateStr: string) => {
    setSelectedDate(dateStr);
    setSelectedTimeSlot(null); // Reset time slot when date changes
  };

  const handleSelectSlot = (slot: {
    time: string;
    displayTime: string;
    startTimeIso: string;
    endTimeIso: string;
    assignedStaffId?: string;
  }) => {
    setSelectedTimeSlot(slot);
  };

  // Step validation rules
  const canProceed = () => {
    if (currentStep === 1) return selectedService !== null;
    if (currentStep === 2) return true; // Staff choice is optional (defaults to Any Available)
    if (currentStep === 3) return selectedDate !== "" && selectedTimeSlot !== null;
    if (currentStep === 4)
      return userProfile !== null && customerName.trim() !== "" && customerEmail.trim() !== "";
    return true;
  };

  const handleProceed = () => {
    if (canProceed() && currentStep < 5) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <BookingProgress
        currentStep={currentStep}
        onStepClick={(step) => setCurrentStep(step)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Main Wizard Container */}
        <div className="lg:col-span-8">
          {currentStep === 1 && (
            <ServiceSelection
              categories={categories}
              services={services}
              selectedServiceId={selectedService?.id || null}
              onSelectService={handleSelectService}
            />
          )}

          {currentStep === 2 && (
            <StaffSelection
              qualifiedStaff={qualifiedStaff}
              selectedStaffId={selectedStaffId}
              onSelectStaff={handleSelectStaff}
            />
          )}

          {currentStep === 3 && (
            <div className="space-y-8">
              <DateSelection
                selectedDate={selectedDate}
                onSelectDate={handleSelectDate}
              />
              {selectedService ? (
                <TimeSlotSelection
                  serviceId={selectedService.id}
                  date={selectedDate}
                  preferredStaffId={selectedStaffId}
                  selectedTimeSlot={selectedTimeSlot}
                  onSelectSlot={handleSelectSlot}
                />
              ) : (
                <p className="text-xs text-muted-foreground">Please select a service first.</p>
              )}
            </div>
          )}

          {currentStep === 4 && (
            <CustomerDetails
              userProfile={userProfile}
              customerName={customerName}
              customerEmail={customerEmail}
              customerPhone={customerPhone}
              notes={notes}
              onUpdateName={setCustomerName}
              onUpdateEmail={setCustomerEmail}
              onUpdatePhone={setCustomerPhone}
              onUpdateNotes={setNotes}
            />
          )}

          {currentStep === 5 && selectedService && selectedTimeSlot && (
            <BookingReview
              serviceId={selectedService.id}
              serviceName={selectedService.name}
              serviceDuration={selectedService.duration_minutes}
              servicePrice={Number(selectedService.price)}
              staffId={selectedStaffId}
              staffName={selectedStaffName}
              dateStr={selectedDate}
              startTimeIso={selectedTimeSlot.startTimeIso}
              timeDisplay={selectedTimeSlot.displayTime}
              customerName={customerName}
              customerEmail={customerEmail}
              customerPhone={customerPhone}
              notes={notes}
              onBack={() => setCurrentStep(4)}
            />
          )}
        </div>

        {/* Right Desktop Persistent Summary Sidebar */}
        <div className="lg:col-span-4">
          <BookingSummary
            serviceName={selectedService?.name || null}
            serviceDuration={selectedService?.duration_minutes || null}
            servicePrice={selectedService ? Number(selectedService.price) : null}
            staffName={selectedStaffName}
            dateStr={selectedDate}
            timeDisplay={selectedTimeSlot?.displayTime || null}
            currentStep={currentStep}
            canProceed={canProceed()}
            onProceed={handleProceed}
          />
        </div>
      </div>
    </div>
  );
}
