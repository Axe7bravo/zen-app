import { useState, useEffect } from 'react'

function App() {
  // Settings State
  const [showSettings, setShowSettings] = useState(false)
  const [focusDuration, setFocusDuration] = useState(() => {
    const saved = localStorage.getItem('zen_focus_duration')
    return saved ? JSON.parse(saved) : 25
  })
  const [breakDuration, setBreakDuration] = useState(() => {
    const saved = localStorage.getItem('zen_break_duration')
    return saved ? JSON.parse(saved) : 5
  })

  // Timer State
  const [minutes, setMinutes] = useState(25)
  const [seconds, setSeconds] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [mode, setMode] = useState(() => {
    const saved = localStorage.getItem('zen_mode')
    return saved ? JSON.parse(saved) : 'focus'
  }) // 'focus' | 'shortBreak' | 'longBreak'

  // Task List State
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('zen_tasks')
    return saved ? JSON.parse(saved) : []
  })
  const [newTaskInput, setNewTaskInput] = useState('')

  useEffect(() => {
    let interval = null

    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            setIsActive(false)
            clearInterval(interval)
            playZenBell()
          } else {
            setMinutes(minutes - 1)
            setSeconds(59)
          }
        } else {
          setSeconds(seconds - 1)
        }
      }, 1000)
    } else {
      clearInterval(interval)
    }

    return () => clearInterval(interval)
  }, [isActive, minutes, seconds])

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('zen_mode', JSON.stringify(mode))
  }, [mode])

  useEffect(() => {
    localStorage.setItem('zen_tasks', JSON.stringify(tasks))
  }, [tasks])

  useEffect(() => {
    localStorage.setItem('zen_focus_duration', JSON.stringify(focusDuration))
    localStorage.setItem('zen_break_duration', JSON.stringify(breakDuration))
  }, [focusDuration, breakDuration])

  // Update timer when settings change if not active
  useEffect(() => {
    if (!isActive) {
      if (mode === 'focus') setMinutes(focusDuration)
      else if (mode === 'shortBreak') setMinutes(breakDuration)
      setSeconds(0)
    }
  }, [focusDuration, breakDuration, mode, isActive])


  const toggleTimer = () => setIsActive(!isActive)

  const resetTimer = () => {
    setIsActive(false)
    if (mode === 'focus') setMinutes(focusDuration)
    else if (mode === 'shortBreak') setMinutes(breakDuration)
    else setMinutes(15) // Long break fixed for now or add setting later
    setSeconds(0)
  }

  const setTimerMode = (newMode) => {
    setMode(newMode)
    setIsActive(false)
    setSeconds(0)
    if (newMode === 'focus') setMinutes(focusDuration)
    else if (newMode === 'shortBreak') setMinutes(breakDuration)
    else setMinutes(15)
  }

  const addTask = (e) => {
    e.preventDefault()
    if (!newTaskInput.trim()) return

    const newTask = {
      id: Date.now(),
      text: newTaskInput,
      completed: false
    }

    setTasks([...tasks, newTask])
    setNewTaskInput('')
  }

  const toggleTask = (id) => {
    setTasks(tasks.map(t =>
      t.id === id ? { ...t, completed: !t.completed } : t
    ))
  }

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id))
  }

  const playZenBell = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      if (!AudioContext) return

      const audioCtx = new AudioContext()
      const oscillator = audioCtx.createOscillator()
      const gainNode = audioCtx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioCtx.destination)

      // Zen Bell Tone
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(432, audioCtx.currentTime) // 432Hz "Healing" frequency

      // Envelope
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 0.1) // Soft attack
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 3) // Long decay

      oscillator.start()
      oscillator.stop(audioCtx.currentTime + 3.5)
    } catch (error) {
      console.error("Audio play failed", error)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4 font-sans selection:bg-purple-500/30 relative">
      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">

        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-900/20 rounded-full blur-[120px]" />
      </div>

      {/* Settings Button */}
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-all z-20"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {/* Settings Modal */}
      {showSettings && (
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-30 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-3xl p-8 border border-white/10 shadow-2xl max-w-sm w-full relative">
            <button
              onClick={() => setShowSettings(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-xl font-light text-white mb-6">Timer Settings</h3>

            <div className="space-y-6">
              <div>
                <label className="block text-slate-400 text-sm mb-2">Focus Duration (minutes)</label>
                <input
                  type="number"
                  value={focusDuration}
                  onChange={(e) => setFocusDuration(Number(e.target.value))}
                  className="w-full bg-white/5 border-b border-white/10 text-white p-2 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-2">Short Break (minutes)</label>
                <input
                  type="number"
                  value={breakDuration}
                  onChange={(e) => setBreakDuration(Number(e.target.value))}
                  className="w-full bg-white/5 border-b border-white/10 text-white p-2 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>

            <button
              onClick={() => setShowSettings(false)}
              className="w-full mt-8 py-3 bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 rounded-xl transition-all text-sm font-medium"
            >
              Done
            </button>
          </div>
        </div>
      )}


      <div className="max-w-4xl w-full relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Left Column: Timer */}
        <div className="space-y-8">
          <header>
            <h1 className="text-4xl font-extralight tracking-[0.2em] text-white">ZEN</h1>
            <p className="text-slate-400 text-sm mt-2 tracking-wide">Mindfulness & focus</p>
          </header>

          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
            {/* Timer Modes */}
            <div className="flex justify-center gap-2 mb-8">
              {[
                { id: 'focus', label: 'Focus' },
                { id: 'shortBreak', label: 'Short Break' },
                { id: 'longBreak', label: 'Long Break' }
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setTimerMode(m.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${mode === m.id
                    ? 'bg-purple-500/20 text-purple-200 ring-1 ring-purple-500/50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Timer Display */}
            <div className="text-center mb-8 relative">
              <div className="text-8xl font-light tabular-nums tracking-tight text-white/90">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </div>
              <div className="absolute -inset-4 bg-purple-500/5 rounded-full blur-2xl -z-10 animate-pulse"></div>
            </div>

            {/* Controls */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={toggleTimer}
                className="px-8 py-3 bg-white/10 hover:bg-white/15 active:scale-95 text-white rounded-xl transition-all duration-200 font-medium backdrop-blur-md border border-white/10 w-32"
              >
                {isActive ? 'Pause' : 'Start'}
              </button>
              <button
                onClick={resetTimer}
                className="px-8 py-3 hover:bg-white/5 active:scale-95 text-slate-400 hover:text-white rounded-xl transition-all duration-200 font-medium border border-transparent hover:border-white/5"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Tasks */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl flex flex-col h-[500px]">
          <h2 className="text-xl font-light text-white/90 mb-6 flex items-center gap-3">
            <span>Tasks</span>
            <span className="text-xs bg-white/5 px-2 py-0.5 rounded-full text-slate-400">
              {tasks.filter(t => !t.completed).length} remaining
            </span>
          </h2>

          {/* Task Input */}
          <form onSubmit={addTask} className="mb-6">
            <input
              type="text"
              value={newTaskInput}
              onChange={(e) => setNewTaskInput(e.target.value)}
              placeholder="Add a new task..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50 focus:bg-white/10 transition-all"
            />
          </form>

          {/* Task List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {tasks.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center">
                <p>No tasks yet.</p>
                <p className="text-sm mt-1">Stay focused on what matters.</p>
              </div>
            )}

            {tasks.map(task => (
              <div
                key={task.id}
                className={`group flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${task.completed ? 'bg-white/5' : 'bg-white/10 hover:bg-white/15'
                  }`}
              >
                <button
                  onClick={() => toggleTask(task.id)}
                  className={`flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${task.completed
                    ? 'border-purple-500/50 bg-purple-500/20 text-purple-300'
                    : 'border-white/20 hover:border-purple-400/50'
                    }`}
                >
                  {task.completed && (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>

                <span className={`flex-1 text-sm transition-all ${task.completed ? 'text-slate-500 line-through' : 'text-slate-200'
                  }`}>
                  {task.text}
                </span>

                <button
                  onClick={() => deleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 text-slate-500 hover:text-red-300 rounded-lg transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Global styles for scrollbar */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        /* Chrome, Safari, Edge, Opera */
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        /* Firefox */
        input[type=number] {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  )
}

export default App
