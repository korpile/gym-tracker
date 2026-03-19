'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function Home() {
  const [workoutName, setWorkoutName] = useState('')
  const [workouts, setWorkouts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Haetaan treenit
  const fetchWorkouts = async () => {
    const { data } = await supabase
      .from('workouts')
      .select('*')
      .order('id', { ascending: false })
    if (data) setWorkouts(data)
  }

  useEffect(() => { fetchWorkouts() }, [])

  // Lisätään treeni
  const addWorkout = async () => {
    if (!workoutName) return
    setLoading(true)
    await supabase.from('workouts').insert([{ name: workoutName }])
    setWorkoutName('')
    await fetchWorkouts()
    setLoading(false)
  }

  // UUSI: Poistetaan treeni ID:n perusteella
  const deleteWorkout = async (id: number) => {
    const { error } = await supabase
      .from('workouts')
      .delete()
      .eq('id', id)

    if (!error) {
      // Päivitetään lista heti poiston jälkeen
      fetchWorkouts()
    } else {
      alert('Poisto epäonnistui: ' + error.message)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-md mx-auto space-y-6">
        
        {/* Syöttölomake */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
          <h1 className="text-3xl font-extrabold text-slate-900 text-center mb-8">
            GymTracker <span className="text-blue-600">Pro</span> 🏋️
          </h1>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Mitä treenasit?"
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
              className="flex-1 px-4 py-3 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
            />
            <button 
              onClick={addWorkout}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-lg transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? '...' : 'Lisää'}
            </button>
          </div>
        </div>

        {/* Lista ja poistonapit */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Treenihistoria</h2>
          <div className="space-y-2">
            {workouts.length === 0 ? (
              <p className="text-center text-slate-400 py-4 text-sm">Ei vielä treenejä. Lisää ensimmäinen!</p>
            ) : (
              workouts.map((workout) => (
                <div key={workout.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center group transition-all hover:bg-white hover:shadow-md">
                  <div>
                    <p className="font-semibold text-slate-700">{workout.name}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                      {new Date(workout.created_at).toLocaleDateString('fi-FI')}
                    </p>
                  </div>
                  <button 
                    onClick={() => deleteWorkout(workout.id)}
                    className="text-slate-300 hover:text-red-500 p-2 transition-colors"
                    title="Poista treeni"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </main>
  )
}