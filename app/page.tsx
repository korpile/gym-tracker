'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function Home() {
  const [workoutName, setWorkoutName] = useState('')
  const [sets, setSets] = useState('')
  const [reps, setReps] = useState('')
  const [weight, setWeight] = useState('')
  const [workouts, setWorkouts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const fetchWorkouts = async () => {
    const { data } = await supabase
      .from('workouts')
      .select('*')
      .order('created_at', { ascending: false }) // Uusimmat päivät ekana
    if (data) setWorkouts(data)
  }

  useEffect(() => { fetchWorkouts() }, [])

  const addWorkout = async () => {
    if (!workoutName) return
    setLoading(true)
    await supabase.from('workouts').insert([{ 
      name: workoutName,
      sets: parseInt(sets) || 0,
      reps: parseInt(reps) || 0,
      weight: parseFloat(weight) || 0
    }])
    setWorkoutName(''); setSets(''); setReps(''); setWeight('')
    await fetchWorkouts()
    setLoading(false)
  }

  const deleteWorkout = async (id: number) => {
    const { error } = await supabase.from('workouts').delete().eq('id', id)
    if (!error) fetchWorkouts()
  }

  // --- RYHMITTELYLOGIIKKA ---
  // Tämä funktio jakaa treenit päivämäärien alle
  const groupedWorkouts = workouts.reduce((groups: any, workout) => {
    const date = new Date(workout.created_at).toLocaleDateString('fi-FI')
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(workout)
    return groups
  }, {})

  return (
    <main className="min-h-screen bg-slate-200 py-12 px-4 font-sans">
      <div className="max-w-md mx-auto space-y-10">
        
        {/* LISÄYSLOMAKE */}
        <div className="bg-white rounded-xl shadow-2xl p-8 border-4 border-black">
          <h1 className="text-4xl font-black text-black text-center mb-8 uppercase italic tracking-tighter">
            GymTracker <span className="text-blue-700">Pro</span>
          </h1>
          
          <div className="space-y-4">
            <input 
              type="text" placeholder="LIIKKEEN NIMI" value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
              className="w-full px-5 py-4 rounded-lg border-4 border-black bg-white text-black text-xl font-bold outline-none placeholder:text-slate-400"
            />
            
            <div className="grid grid-cols-3 gap-3">
              <input type="number" placeholder="S" value={sets} onChange={(e) => setSets(e.target.value)} className="px-2 py-4 rounded-lg border-4 border-black bg-white text-black text-2xl font-black text-center" />
              <input type="number" placeholder="R" value={reps} onChange={(e) => setReps(e.target.value)} className="px-2 py-4 rounded-lg border-4 border-black bg-white text-black text-2xl font-black text-center" />
              <input type="number" placeholder="kg" value={weight} onChange={(e) => setWeight(e.target.value)} className="px-2 py-4 rounded-lg border-4 border-black bg-white text-black text-2xl font-black text-center" />
            </div>

            <button onClick={addWorkout} disabled={loading} className="w-full bg-blue-700 hover:bg-black text-white font-black text-2xl py-6 rounded-xl border-b-8 border-blue-900 active:border-b-0 active:translate-y-2">
              {loading ? 'TALLENNETAAN...' : 'TALLENNA'}
            </button>
          </div>
        </div>

        {/* HISTORIA RYHMITELTYNÄ */}
        <div className="space-y-8">
          <h2 className="text-3xl font-black text-black border-b-8 border-black inline-block pb-1 uppercase">Historia</h2>
          
          {Object.keys(groupedWorkouts).length === 0 ? (
            <div className="bg-white p-10 rounded-xl border-4 border-black border-dashed text-center">
              <p className="text-black font-black text-xl italic uppercase">Ei treenejä!</p>
            </div>
          ) : (
            // Käydään läpi jokainen päivämäärä
            Object.keys(groupedWorkouts).map((date) => (
              <div key={date} className="space-y-3">
                <h3 className="text-xl font-black bg-yellow-300 text-black px-4 py-1 inline-block border-2 border-black transform -rotate-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  {date}
                </h3>
                
                <div className="space-y-3 pl-2 border-l-4 border-black">
                  {groupedWorkouts[date].map((w: any) => (
                    <div key={w.id} className="p-5 bg-white rounded-xl flex justify-between items-center border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 transition-transform">
                      <div>
                        <p className="text-xl font-black text-black uppercase tracking-tighter">{w.name}</p>
                        <p className="text-lg text-blue-800 font-black italic uppercase">
                          {w.sets} × {w.reps} — <span className="bg-blue-100 px-2 border border-blue-300">{w.weight} KG</span>
                        </p>
                      </div>
                      <button onClick={() => deleteWorkout(w.id)} className="bg-red-500 text-white p-3 rounded-lg border-2 border-black hover:bg-black transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  )
}