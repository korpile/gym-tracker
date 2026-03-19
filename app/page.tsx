'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function Home() {
  const [workoutName, setWorkoutName] = useState('')
  const [workouts, setWorkouts] = useState<any[]>([]) // Tänne tallennetaan haetut treenit
  const [loading, setLoading] = useState(false)
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

  // 1. Funktio, joka hakee treenit Supabasesta
  const fetchWorkouts = async () => {
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .order('id', { ascending: false }) // Uusimmat ensin

    if (data) setWorkouts(data)
    if (error) console.error("Haku epäonnistui:", error)
  }

  // 2. Haetaan treenit heti, kun sivu avataan
  useEffect(() => {
    fetchWorkouts()
  }, [])

  const addWorkout = async () => {
    if (!workoutName) return alert('Kirjoita treenin nimi!')
    
    setLoading(true)
    try {
      const { error } = await supabase
        .from('workouts')
        .insert([{ name: workoutName }])

      if (error) throw error

      setWorkoutName('')
      fetchWorkouts() // 3. Päivitetään lista heti tallennuksen jälkeen
    } catch (error: any) {
      alert('Virhe: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-md mx-auto space-y-6">
        
        {/* Lomake */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
          <h1 className="text-3xl font-extrabold text-slate-900 text-center mb-8">
            GymTracker <span className="text-blue-600">Pro</span> 🏋️
          </h1>

          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="Mitä treenasit?"
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
            />
            <button 
              onClick={addWorkout}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all"
            >
              {loading ? 'Tallennetaan...' : 'Tallenna treeni'}
            </button>
          </div>
        </div>

        {/* Treenilista */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-4 text-center">Treenihistoria</h2>
          
          <div className="space-y-2">
            {workouts.length === 0 ? (
              <p className="text-center text-slate-400">Ei vielä tallennettuja treenejä.</p>
            ) : (
              workouts.map((workout) => (
                <div key={workout.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-slate-700 flex justify-between items-center">
                  <span className="font-medium">{workout.name}</span>
                  <span className="text-xs text-slate-400">
                    {new Date(workout.created_at).toLocaleDateString('fi-FI')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </main>
  )
}