
import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import AppHeader from "@/components/layout/AppHeader";

const featuredSymbols = [
  { symbol: "AAPL", name: "Apple Inc." },
  { symbol: "MSFT", name: "Microsoft Corporation" },
  { symbol: "AMZN", name: "Amazon.com Inc." },
  { symbol: "GOOG", name: "Alphabet Inc." },
  { symbol: "META", name: "Meta Platforms Inc." },
  { symbol: "TSLA", name: "Tesla Inc." }
];

const industryOptions = [
  "Investment Banking",
  "Asset Management",
  "Hedge Fund",
  "Private Equity",
  "Venture Capital",
  "Commercial Banking",
  "Insurance",
  "Fintech",
  "Consulting",
  "Research",
  "Other Financial Services"
];

const jobRoleOptions = [
  "Analyst",
  "Associate",
  "Portfolio Manager",
  "Fund Manager",
  "Investment Advisor",
  "Financial Advisor",
  "Trader",
  "Research Analyst",
  "Equity Research Analyst",
  "Chief Investment Officer",
  "Risk Manager",
  "Compliance Officer",
  "Other"
];

const Profile = () => {
  const { user, profile, loading, signOut, updateProfile } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  
  // Form state
  const [firstName, setFirstName] = useState(profile?.first_name || "");
  const [lastName, setLastName] = useState(profile?.last_name || "");
  const [firmName, setFirmName] = useState(profile?.firm_name || "");
  const [jobRole, setJobRole] = useState(profile?.job_role || "");
  const [industry, setIndustry] = useState(profile?.industry || "");
  const [location, setLocation] = useState(profile?.location || "");
  const [yearsExperience, setYearsExperience] = useState(
    profile?.years_experience !== null ? String(profile?.years_experience) : ""
  );

  // If user is not logged in, redirect to login page
  if (!user && !loading) {
    return <Navigate to="/auth" />;
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      
      await updateProfile({
        first_name: firstName,
        last_name: lastName,
        firm_name: firmName,
        job_role: jobRole,
        industry,
        location,
        years_experience: yearsExperience ? parseInt(yearsExperience) : null
      });
    } catch (error) {
      console.error("Update profile error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <AppHeader featuredSymbols={featuredSymbols} />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  return (
    <>
      <AppHeader featuredSymbols={featuredSymbols} />
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
        
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardHeader>
            
            <form onSubmit={handleUpdateProfile}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input 
                      id="firstName" 
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName" 
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    value={user?.email || ""}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your email cannot be changed
                  </p>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label htmlFor="firmName">Firm/Company Name</Label>
                  <Input 
                    id="firmName" 
                    value={firmName}
                    onChange={(e) => setFirmName(e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Select value={industry} onValueChange={setIndustry}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {industryOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="jobRole">Job Role</Label>
                    <Select value={jobRole} onValueChange={setJobRole}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {jobRoleOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input 
                      id="location" 
                      placeholder="City, Country" 
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="yearsExperience">Years Experience</Label>
                    <Input 
                      id="yearsExperience" 
                      type="number" 
                      min="0"
                      value={yearsExperience}
                      onChange={(e) => setYearsExperience(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <Button variant="outline" type="button" onClick={signOut}>
                  Sign Out
                </Button>
                
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving
                    </>
                  ) : "Save Changes"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Profile;
