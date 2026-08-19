"use client";
import { useState, useEffect } from "react";
import { Target, Plus, CheckCircle2, Circle, Calendar, Loader2, Trash2 } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { getApiUrl } from "@/lib/api";

interface Goal {
  ID: string;
  UserID: string;
  Title: string;
  TargetDate?: string;
  Status: string;
  CreatedAt: string;
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalDate, setNewGoalDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Get auth token from localStorage
  const getToken = () => localStorage.getItem("token");

  // Fetch goals
  const fetchGoals = async (showLoader = false) => {
    if (showLoader) {
      setRefreshing(true);
    }
    try {
      const response = await fetch(`${getApiUrl()}/api/goals`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Fetched goals:", data);
        setGoals(data || []);
      }
    } catch (error) {
      console.error("Error fetching goals:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Create new goal
  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;

    setSubmitting(true);
    try {
      const payload: any = {
        title: newGoalTitle,
        status: "active",
      };

      // Only add target_date if a date is selected
      if (newGoalDate) {
        payload.target_date = new Date(newGoalDate).toISOString();
      }

      console.log("Creating goal with payload:", payload);

      const response = await fetch(`${getApiUrl()}/api/goals`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Goal created successfully:", data);
        
        // Add the new goal to state immediately (optimistic update)
        setGoals([...goals, data]);
        
        // Reset form
        setNewGoalTitle("");
        setNewGoalDate("");
        setShowAddForm(false);
        
        // Wait a bit longer before refreshing to ensure backend has committed
        setTimeout(() => {
          console.log("Fetching updated goals list...");
          fetchGoals(true);
        }, 500);
      } else {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        alert(`Failed to create goal: ${errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error creating goal:", error);
      alert("Error creating goal. Check console for details.");
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle goal status (for future implementation)
  const toggleGoalStatus = async (goal: Goal) => {
    // This would need a PUT endpoint in the backend
    console.log("Toggle goal:", goal.ID);
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const activeGoals = goals.filter((g) => g.Status === "active");
  const completedGoals = goals.filter((g) => g.Status === "completed");

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-neutral-950 text-white pt-20 lg:pt-32 px-4 lg:px-8 pb-12">
        <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-8 h-8 text-neutral-300" />
            <h1 className="text-4xl font-bold text-neutral-100">Your Goals</h1>
          </div>
          <p className="text-neutral-400">Track your learning objectives and achievements</p>
        </div>

        {/* Add Goal Button */}
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="mb-6 flex items-center gap-2 px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add New Goal
          </button>
        )}

        {/* Add Goal Form */}
        {showAddForm && (
          <div className="mb-6 p-4 bg-neutral-900 rounded-lg border border-neutral-800">
            <h3 className="text-lg font-semibold mb-4">Create New Goal</h3>
            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-300">
                  Goal Title
                </label>
                <input
                  type="text"
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                  placeholder="e.g., Complete Python course, Read 5 books..."
                  className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-600"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-300">
                  Target Date (Optional)
                </label>
                <input
                  type="date"
                  value={newGoalDate}
                  onChange={(e) => setNewGoalDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neutral-600"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting || !newGoalTitle.trim()}
                  className="px-6 py-2.5 bg-neutral-300 text-black rounded-lg font-medium hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Goal"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewGoalTitle("");
                    setNewGoalDate("");
                  }}
                  className="px-6 py-2.5 bg-neutral-800 text-white rounded-lg font-medium hover:bg-neutral-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-neutral-600" />
          </div>
        ) : refreshing ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2 text-neutral-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Refreshing goals...</span>
            </div>
          </div>
        ) : (
          <>
            {/* Active Goals */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-neutral-200">
                Active Goals ({activeGoals.length})
              </h2>
              {activeGoals.length === 0 ? (
                <div className="p-8 bg-neutral-900/50 rounded-lg border border-neutral-800 text-center">
                  <Target className="w-12 h-12 mx-auto mb-3 text-neutral-600" />
                  <p className="text-neutral-500">No active goals yet. Create one to get started!</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {activeGoals.map((goal) => (
                    <div
                      key={goal.ID}
                      className="p-5 bg-neutral-900 rounded-lg border border-neutral-800 hover:border-neutral-700 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <button
                          onClick={() => toggleGoalStatus(goal)}
                          className="mt-1 text-neutral-400 hover:text-neutral-200 transition-colors"
                        >
                          <Circle className="w-6 h-6" />
                        </button>
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-neutral-100 mb-2">
                            {goal.Title}
                          </h3>
                          <div className="flex flex-wrap gap-4 text-sm text-neutral-400">
                            {goal.TargetDate && (
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4" />
                                <span>
                                  Target: {new Date(goal.TargetDate).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-1.5">
                              <span>
                                Created: {new Date(goal.CreatedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Completed Goals */}
            {completedGoals.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-4 text-neutral-200">
                  Completed ({completedGoals.length})
                </h2>
                <div className="grid gap-4">
                  {completedGoals.map((goal) => (
                    <div
                      key={goal.ID}
                      className="p-5 bg-neutral-900/50 rounded-lg border border-neutral-800 opacity-75"
                    >
                      <div className="flex items-start gap-4">
                        <CheckCircle2 className="w-6 h-6 mt-1 text-green-500" />
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-neutral-300 line-through mb-2">
                            {goal.Title}
                          </h3>
                          <div className="flex flex-wrap gap-4 text-sm text-neutral-500">
                            {goal.TargetDate && (
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4" />
                                <span>
                                  Target: {new Date(goal.TargetDate).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-1.5">
                              <span>
                                Completed: {new Date(goal.CreatedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
    </ProtectedRoute>
  );
}


