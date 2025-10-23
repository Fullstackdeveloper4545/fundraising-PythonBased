"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import type { Campaign, User } from "@/types/api";
import { useAuth } from "@/context/AuthContext";
import Swal from "sweetalert2";
import StudentProfileModal from "@/components/StudentProfileModal";

interface PlatformStats {
  total_users: number;
  total_campaigns: number;
  total_donations: number;
  active_campaigns: number;
}

export default function AdminDashboard() {
  const { token, user, logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'campaigns' | 'users'>('overview');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [showStudentProfile, setShowStudentProfile] = useState(false);
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<User | null>(null);
  const [studentForm, setStudentForm] = useState({
    student_id: "",
    class: "",
    academic_results: "",
    phone: "",
    address: "",
    date_of_birth: "",
    emergency_contact: "",
    emergency_phone: "",
  });
  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    goal_amount: 1000,
    duration_months: "3" as "1" | "3" | "6" | "12",
    category: "",
    image_url: "",
    video_url: "",
    story: "",
  });
  // removed local modal state in favor of SweetAlert2

  useEffect(() => {
    if (!token || !user || user.role !== "admin") {
      router.push("/admin/login");
      return;
    }
    
    const loadData = async () => {
      try {
        const [statsData, campaignsData, usersData] = await Promise.all([
          apiFetch<PlatformStats>(`/admin/stats`, { token }),
          apiFetch<Campaign[]>(`/admin/campaigns`, { token }),
          apiFetch<User[]>(`/admin/users`, { token }),
        ]);
        
        setStats(statsData);
        setCampaigns(Array.isArray(campaignsData) ? campaignsData : []);
        setUsers(Array.isArray(usersData) ? usersData : []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load admin data");
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [token, user, router]);

  const handleFeatureCampaign = async (campaignId: number) => {
    try {
      await apiFetch(`/admin/campaigns/${campaignId}/feature`, { 
        method: "POST", 
        token 
      });
      // Reload campaigns to show updated status
      const campaignsData = await apiFetch<Campaign[]>(`/admin/campaigns`, { token });
      setCampaigns(Array.isArray(campaignsData) ? campaignsData : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to feature campaign");
    }
  };

  const handleCloseCampaign = async (campaignId: number) => {
    try {
      await apiFetch(`/admin/campaigns/${campaignId}/close`, {
        method: "POST",
        token,
      });
      const campaignsData = await apiFetch<Campaign[]>(`/admin/campaigns`, { token });
      setCampaigns(Array.isArray(campaignsData) ? campaignsData : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to close campaign");
    }
  };

  const handleCreateCampaign = async () => {
    try {
      await apiFetch(`/campaigns/`, { method: "POST", token, body: createForm });
      const campaignsData = await apiFetch<Campaign[]>(`/admin/campaigns`, { token });
      setCampaigns(Array.isArray(campaignsData) ? campaignsData : []);
      setShowCreate(false);
      setCreateForm({ title: "", description: "", goal_amount: 1000, duration_months: "3", category: "", image_url: "", video_url: "", story: "" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create campaign");
    }
  };

  const handleViewStudentProfile = (user: User) => {
    setSelectedStudent(user);
    setShowStudentProfile(true);
  };

  const handleStudentProfileConfirm = () => {
    // Here you can add additional logic for when the admin confirms viewing student details
    console.log("Admin confirmed viewing student profile:", selectedStudent);
  };

  const handleEditStudent = (user: User) => {
    setEditingStudent(user);
    setStudentForm({
      student_id: user.student_id || "",
      class: user.class || "",
      academic_results: user.academic_results || "",
      phone: user.phone || "",
      address: user.address || "",
      date_of_birth: user.date_of_birth || "",
      emergency_contact: user.emergency_contact || "",
      emergency_phone: user.emergency_phone || "",
    });
    setShowStudentForm(true);
  };

  const handleSaveStudentDetails = async () => {
    if (!editingStudent) return;
    
    try {
      // Map frontend field names to backend field names
      const backendData = {
        student_id: studentForm.student_id,
        class_name: studentForm.class, // Map 'class' to 'class_name' for backend
        academic_results: studentForm.academic_results,
        phone: studentForm.phone,
        address: studentForm.address,
        date_of_birth: studentForm.date_of_birth,
        emergency_contact: studentForm.emergency_contact,
        emergency_phone: studentForm.emergency_phone,
      };
      
      await apiFetch(`/admin/users/${editingStudent.id}`, {
        method: "PUT",
        token,
        body: backendData,
      });
      
      // Reload users to show updated data
      const usersData = await apiFetch<User[]>(`/admin/users`, { token });
      setUsers(Array.isArray(usersData) ? usersData : []);
      
      setShowStudentForm(false);
      setEditingStudent(null);
      setStudentForm({
        student_id: "",
        class: "",
        academic_results: "",
        phone: "",
        address: "",
        date_of_birth: "",
        emergency_contact: "",
        emergency_phone: "",
      });
      
      Swal.fire({
        title: 'Success!',
        text: 'Student details updated successfully.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update student details");
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
  };

  const handleLogoutClick = () => {
    Swal.fire({
      title: 'Logout',
      text: 'Are you sure you want to log out?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Logout',
      cancelButtonText: 'Cancel',
      width: '520px',
      backdrop: `rgba(0,0,0,0.4)`,
      buttonsStyling: false,
      customClass: {
        popup: 'swal2-popup-custom',
        container: 'swal2-backdrop-blur',
        confirmButton: 'btn-primary',
        cancelButton: 'btn-outline'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        handleLogout();
        Swal.fire({
          title: 'Logged out',
          icon: 'success',
          timer: 1400,
          showConfirmButton: false,
          width: '420px'
        });
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-lg">Loading admin dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600/90 shadow backdrop-blur supports-[backdrop-filter]:backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center mr-3 shadow-sm">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-sm text-white/90">Welcome back, {user?.first_name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/"
                className="text-sm text-white/90 hover:text-white transition-colors"
              >
                View Site
              </a>
              <button
                onClick={handleLogoutClick}
                className="text-sm text-white/90 hover:text-white transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
          <nav className="flex gap-1">
            {[
              { 
                id: 'overview', 
                name: 'Overview', 
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                )
              },
              { 
                id: 'campaigns', 
                name: 'Campaigns', 
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                )
              },
              { 
                id: 'users', 
                name: 'Users', 
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                )
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span className={`transition-colors ${
                  activeTab === tab.id ? 'text-white' : 'text-gray-500'
                }`}>
                  {tab.icon}
                </span>
                <span>{tab.name}</span>
                {activeTab === tab.id && (
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Welcome back, {user?.first_name}!</h2>
                  <p className="text-indigo-100 text-lg">Here's what's happening with your platform today</p>
                </div>
                <div className="hidden md:block">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Users</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.total_users || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm text-green-600">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span>+12% from last month</span>
                  </div>
                </div>
              </div>

              <div className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.total_campaigns || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm text-green-600">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span>+8% from last month</span>
                  </div>
                </div>
              </div>

              <div className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Raised</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">${(stats?.total_donations || 0).toLocaleString()}</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm text-green-600">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span>+24% from last month</span>
                  </div>
                </div>
              </div>

              <div className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.active_campaigns || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm text-green-600">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span>+5% from last month</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button 
                  onClick={() => setActiveTab('campaigns')}
                  className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Create Campaign</p>
                    <p className="text-sm text-gray-500">Start a new fundraising campaign</p>
                  </div>
                </button>
                
                <button 
                  onClick={() => setActiveTab('users')}
                  className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Manage Users</p>
                    <p className="text-sm text-gray-500">View and manage user accounts</p>
                  </div>
                </button>
                
                <button className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">View Reports</p>
                    <p className="text-sm text-gray-500">Analytics and insights</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'campaigns' && (
          <div className="space-y-6">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">Campaign Management</h3>
                  <p className="mt-1 text-blue-100">Monitor and manage all fundraising campaigns</p>
                </div>
                <button 
                  onClick={() => setShowCreate(true)} 
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 backdrop-blur-sm border border-white/20"
                >
                  <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Campaign
                </button>
              </div>
            </div>

            {/* Campaigns Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                  {/* Campaign Header */}
                  <div className="p-6 pb-4">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {campaign.title}
                      </h4>
                      <span className={`ml-3 px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
                        campaign.status === 'active' 
                          ? 'bg-green-100 text-green-800'
                          : campaign.status === 'paused'
                          ? 'bg-yellow-100 text-yellow-800'
                          : campaign.status === 'completed'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {campaign.status}
                      </span>
                    </div>
                    
                    {/* Campaign Stats */}
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Goal</span>
                        <span className="font-medium text-gray-900">${campaign.goal_amount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Raised</span>
                        <span className="font-medium text-green-600">${campaign.current_amount.toLocaleString()}</span>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Progress</span>
                          <span>{Math.round((campaign.current_amount / campaign.goal_amount) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, (campaign.current_amount / campaign.goal_amount) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Campaign Actions */}
                  <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleFeatureCampaign(campaign.id)}
                          className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-200 ${
                            campaign.is_featured 
                              ? 'bg-blue-100 text-blue-700' 
                              : 'bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700'
                          }`}
                        >
                          {campaign.is_featured ? '⭐ Featured' : 'Feature'}
                        </button>
                        <button
                          onClick={() => setSelectedCampaign(campaign)}
                          className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-medium transition-all duration-200"
                          title="View campaign details"
                        >
                          View Details
                        </button>
                      </div>
                      <select
                        onChange={async (e) => {
                          const next = e.target.value as any;
                          try {
                            await apiFetch(`/admin/campaigns/${campaign.id}/status/${next}`, { method: 'POST', token });
                            const campaignsData = await apiFetch<Campaign[]>(`/admin/campaigns`, { token });
                            setCampaigns(Array.isArray(campaignsData) ? campaignsData : []);
                          } catch (err) {
                            setError(err instanceof Error ? err.message : 'Failed to update status');
                          }
                        }}
                        value={campaign.status}
                        className="text-xs rounded-lg border border-gray-300 px-2 py-1 bg-white text-gray-700 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition"
                        title="Set campaign status"
                      >
                        {['draft','active','paused','completed','cancelled','expired'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {campaigns.length === 0 && (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns yet</h3>
                <p className="text-gray-500 mb-4">Get started by creating your first campaign</p>
                <button 
                  onClick={() => setShowCreate(true)} 
                  className="btn-primary"
                >
                  Create Campaign
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">User Management</h3>
                  <p className="mt-1 text-purple-100">Manage user accounts and permissions</p>
                </div>
                <div className="bg-white/20 rounded-lg px-4 py-2 backdrop-blur-sm border border-white/20">
                  <span className="text-sm font-medium">{users.length} Total Users</span>
                </div>
              </div>
            </div>

            {/* Users Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {users.map((user) => (
                <div key={user.id} className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                  {/* User Header */}
                  <div className="p-6 pb-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-lg">
                          {user.first_name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {user.first_name} {user.last_name}
                          </h4>
                          <p className="text-sm text-gray-500 truncate max-w-[200px]">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
                        user.role === 'admin' 
                          ? 'bg-red-100 text-red-800'
                          : user.role === 'student'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                    
                    {/* User Stats */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Status
                        </span>
                        <span className={`font-medium ${
                          user.status === 'active' 
                            ? 'text-green-600' 
                            : 'text-gray-600'
                        }`}>
                          {user.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          Verification
                        </span>
                        <span className={`font-medium ${
                          user.is_verified 
                            ? 'text-green-600' 
                            : 'text-yellow-600'
                        }`}>
                          {user.is_verified ? 'Verified' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* User Actions */}
                  <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleViewStudentProfile(user)}
                          className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-medium transition-all duration-200"
                        >
                          View Profile
                        </button>
                        <button 
                          onClick={() => handleEditStudent(user)}
                          className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg font-medium transition-all duration-200"
                        >
                          Edit
                        </button>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          user.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                        }`}></div>
                        <span className="text-xs text-gray-500">
                          {user.status === 'active' ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {users.length === 0 && (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                <p className="text-gray-500">Users will appear here once they register</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* View Details Modal */}
      {selectedCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelectedCampaign(null)} />
          <div className="relative w-full max-w-lg rounded-lg bg-white shadow-lg border border-gray-100 p-6">
            <div className="flex items-start justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Campaign Details</h2>
              <button onClick={() => setSelectedCampaign(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="mt-4 space-y-2">
              <DetailRow label="Title" value={selectedCampaign.title} />
              <DetailRow label="Status" value={<span className="capitalize">{selectedCampaign.status}</span>} />
              <DetailRow label="Description" value={<span className="whitespace-pre-wrap">{selectedCampaign.description}</span>} />
              <DetailRow label="Goal Amount" value={`$${selectedCampaign.goal_amount.toLocaleString()}`} />
              <DetailRow label="Received Amount" value={`$${selectedCampaign.current_amount.toLocaleString()}`} />
              <DetailRow label="Story" value={<span className="whitespace-pre-wrap">{selectedCampaign.story || '-'}</span>} />
              <DetailRow label="Start Date" value={selectedCampaign.start_date ? new Date(selectedCampaign.start_date).toLocaleDateString() : '-'} />
              <DetailRow label="End Date" value={selectedCampaign.end_date ? new Date(selectedCampaign.end_date).toLocaleDateString() : '-'} />
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => setSelectedCampaign(null)} className="btn-primary text-sm px-4 py-2">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Create Campaign Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowCreate(false)} />
          <div className="relative w-full max-w-lg rounded-lg bg-white shadow-lg border border-gray-100 p-6">
            <div className="flex items-start justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Create New Campaign</h2>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="mt-4 grid gap-3">
              <input className="rounded border border-gray-300 bg-white px-3 py-2 text-sm" placeholder="Title" value={createForm.title} onChange={e => setCreateForm({ ...createForm, title: e.target.value })} />
              <textarea className="rounded border border-gray-300 bg-white px-3 py-2 text-sm" placeholder="Description" rows={3} value={createForm.description} onChange={e => setCreateForm({ ...createForm, description: e.target.value })} />
              <textarea className="rounded border border-gray-300 bg-white px-3 py-2 text-sm" placeholder="Story (optional)" rows={3} value={createForm.story} onChange={e => setCreateForm({ ...createForm, story: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <input type="number" className="rounded border border-gray-300 bg-white px-3 py-2 text-sm" placeholder="Goal Amount" value={createForm.goal_amount} onChange={e => setCreateForm({ ...createForm, goal_amount: Number(e.target.value) })} />
                <select className="rounded border border-gray-300 bg-white px-3 py-2 text-sm" value={createForm.duration_months} onChange={e => setCreateForm({ ...createForm, duration_months: e.target.value as any })}>
                  <option value="1">1 month</option>
                  <option value="3">3 months</option>
                  <option value="6">6 months</option>
                  <option value="12">12 months</option>
                </select>
              </div>
              <input className="rounded border border-gray-300 bg-white px-3 py-2 text-sm" placeholder="Category (optional)" value={createForm.category} onChange={e => setCreateForm({ ...createForm, category: e.target.value })} />
              <input className="rounded border border-gray-300 bg-white px-3 py-2 text-sm" placeholder="Image URL (optional)" value={createForm.image_url} onChange={e => setCreateForm({ ...createForm, image_url: e.target.value })} />
              <input className="rounded border border-gray-300 bg-white px-3 py-2 text-sm" placeholder="Video URL (optional)" value={createForm.video_url} onChange={e => setCreateForm({ ...createForm, video_url: e.target.value })} />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setShowCreate(false)} className="btn-outline text-sm px-4 py-2">Cancel</button>
              <button onClick={handleCreateCampaign} className="btn-primary text-sm px-4 py-2">Create</button>
            </div>
          </div>
        </div>
      )}

      {/* Student Details Form Modal */}
      {showStudentForm && editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowStudentForm(false)} />
          <div className="relative w-full max-w-2xl rounded-lg bg-white shadow-lg border border-gray-100 p-6">
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Edit Student Details - {editingStudent.first_name} {editingStudent.last_name}
              </h2>
              <button 
                onClick={() => setShowStudentForm(false)} 
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
                <input 
                  className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm" 
                  placeholder="Student ID" 
                  value={studentForm.student_id} 
                  onChange={e => setStudentForm({ ...studentForm, student_id: e.target.value })} 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                <input 
                  className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm" 
                  placeholder="Class/Grade" 
                  value={studentForm.class} 
                  onChange={e => setStudentForm({ ...studentForm, class: e.target.value })} 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input 
                  className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm" 
                  placeholder="Phone Number" 
                  value={studentForm.phone} 
                  onChange={e => setStudentForm({ ...studentForm, phone: e.target.value })} 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input 
                  type="date"
                  className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm" 
                  value={studentForm.date_of_birth} 
                  onChange={e => setStudentForm({ ...studentForm, date_of_birth: e.target.value })} 
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea 
                  className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm" 
                  placeholder="Full Address" 
                  rows={2}
                  value={studentForm.address} 
                  onChange={e => setStudentForm({ ...studentForm, address: e.target.value })} 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
                <input 
                  className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm" 
                  placeholder="Emergency Contact Name" 
                  value={studentForm.emergency_contact} 
                  onChange={e => setStudentForm({ ...studentForm, emergency_contact: e.target.value })} 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Phone</label>
                <input 
                  className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm" 
                  placeholder="Emergency Contact Phone" 
                  value={studentForm.emergency_phone} 
                  onChange={e => setStudentForm({ ...studentForm, emergency_phone: e.target.value })} 
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Academic Results</label>
                <textarea 
                  className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm" 
                  placeholder="Academic results, grades, achievements, etc." 
                  rows={4}
                  value={studentForm.academic_results} 
                  onChange={e => setStudentForm({ ...studentForm, academic_results: e.target.value })} 
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-2">
              <button 
                onClick={() => setShowStudentForm(false)} 
                className="btn-outline text-sm px-4 py-2"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveStudentDetails} 
                className="btn-primary text-sm px-4 py-2"
              >
                Save Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Profile Modal */}
      <StudentProfileModal
        isOpen={showStudentProfile}
        onClose={() => setShowStudentProfile(false)}
        onConfirm={handleStudentProfileConfirm}
        student={selectedStudent}
      />

    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-sm text-gray-900 max-w-sm text-right">{value}</div>
    </div>
  );
}


