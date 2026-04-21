import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameSession } from '../hooks/useGameSession'

const ANIMALS = [
  'Dog', 'Cat', 'Cow', 'Pig', 'Frog', 'Lion',
  'Bear', 'Elephant', 'Giraffe', 'Penguin', 'Fox', 'Duck',
  'Rabbit', 'Monkey', 'Horse', 'Tiger', 'Zebra', 'Turtle',
]

const ANIMAL_EMOJIS = {
  Dog: '🐶',
  Cat: '🐱',
  Cow: '🐮',
  Pig: '🐷',
  Frog: '🐸',
  Lion: '🦁',
  Bear: '🐻',
  Elephant: '🐘',
  Giraffe: '🦒',
  Penguin: '🐧',
  Fox: '🦊',
  Duck: '🦆',
  Rabbit: '🐰',
  Monkey: '🐵',
  Horse: '🐴',
  Tiger: '🐯',
  Zebra: '🦓',
  Turtle: '🐢',
}

// Verified Wikimedia Commons thumbnail URLs
const ANIMAL_IMAGES = {
  Dog: [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Labrador_on_Quantock_%282175262184%29.jpg/500px-Labrador_on_Quantock_%282175262184%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Golden_Retriever_Dukedestiny01_drvd.jpg/500px-Golden_Retriever_Dukedestiny01_drvd.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/German_Shepherd_-_DSC_0346_%2810096362833%29.jpg/500px-German_Shepherd_-_DSC_0346_%2810096362833%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Beagle_600.jpg/500px-Beagle_600.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Huskiesatrest.jpg/500px-Huskiesatrest.jpg',
  ],
  Cat: [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Cat_August_2010-4.jpg/500px-Cat_August_2010-4.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Siamese_cat_Vaillante.JPG/480px-Siamese_cat_Vaillante.JPG',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Persialainen.jpg/480px-Persialainen.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/M%C3%A2le_Black_Silver_Blotched_Tabby.jpeg/500px-M%C3%A2le_Black_Silver_Blotched_Tabby.jpeg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Paintedcats_Red_Star_standing.jpg/500px-Paintedcats_Red_Star_standing.jpg',
  ],
  Cow: [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Cow_%28Fleckvieh_breed%29_Oeschinensee_Slaunger_2009-07-07.jpg/500px-Cow_%28Fleckvieh_breed%29_Oeschinensee_Slaunger_2009-07-07.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Bou%C3%ABts_d%27J%C3%A8rri_%C3%8Agypte_5_J%C3%A8rri_Mai_2009.jpg/500px-Bou%C3%ABts_d%27J%C3%A8rri_%C3%8Agypte_5_J%C3%A8rri_Mai_2009.jpg',
  ],
  Pig: [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Pig_farm_Vampula_1.jpg/500px-Pig_farm_Vampula_1.jpg',
  ],
  Frog: [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Red-eyed_Leaf_Frog_%2849661076226%29.jpg/500px-Red-eyed_Leaf_Frog_%2849661076226%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/North-American-bullfrog1.jpg/500px-North-American-bullfrog1.jpg',
  ],
  Lion: [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/020_The_lion_king_Snyggve_in_the_Serengeti_National_Park_Photo_by_Giles_Laurent.jpg/500px-020_The_lion_king_Snyggve_in_the_Serengeti_National_Park_Photo_by_Giles_Laurent.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Lions.Gir5_%28cropped%29.jpg/500px-Lions.Gir5_%28cropped%29.jpg',
  ],
  Bear: [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Ours_brun_parcanimalierpyrenees_1.jpg/500px-Ours_brun_parcanimalierpyrenees_1.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/2010-kodiak-bear-1.jpg/500px-2010-kodiak-bear-1.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Polar_Bear_-_Alaska_%28cropped%29.jpg/500px-Polar_Bear_-_Alaska_%28cropped%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Grosser_Panda.JPG/500px-Grosser_Panda.JPG',
  ],
  Elephant: [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/African_Bush_Elephant.jpg/500px-African_Bush_Elephant.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Elephas_maximus_%28Bandipur%29.jpg/500px-Elephas_maximus_%28Bandipur%29.jpg',
  ],
  Giraffe: [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Giraffe_Mikumi_National_Park.jpg/500px-Giraffe_Mikumi_National_Park.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Two_Giraffes.PNG/500px-Two_Giraffes.PNG',
  ],
  Penguin: [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Aptenodytes_forsteri_-Snow_Hill_Island%2C_Antarctica_-adults_and_juvenile-8.jpg/500px-Aptenodytes_forsteri_-Snow_Hill_Island%2C_Antarctica_-adults_and_juvenile-8.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Wikimania_2018%2C_Cape_Town_%28_1050602%29%2C_crop.jpg/500px-Wikimania_2018%2C_Cape_Town_%28_1050602%29%2C_crop.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Blue_Penguin_Kapiti.jpg/500px-Blue_Penguin_Kapiti.jpg',
  ],
  Fox: [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Vulpes_vulpes_ssp_fulvus.jpg/500px-Vulpes_vulpes_ssp_fulvus.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Portrait_of_a_red_fox_in_Rautas_fj%C3%A4llurskog_%28cropped%29.jpg/500px-Portrait_of_a_red_fox_in_Rautas_fj%C3%A4llurskog_%28cropped%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Vulpes_lagopus_in_Iceland_%28cropped_3%29.jpg/500px-Vulpes_lagopus_in_Iceland_%28cropped_3%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Fennec_Fox_Vulpes_zerda.jpg/500px-Fennec_Fox_Vulpes_zerda.jpg',
  ],
  Duck: [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Bucephala-albeola-010.jpg/500px-Bucephala-albeola-010.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Anas_platyrhynchos_male_female_quadrat.jpg/500px-Anas_platyrhynchos_male_female_quadrat.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Wood_Duck_Wissahickon_Creek.png/500px-Wood_Duck_Wissahickon_Creek.png',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Pair_of_mandarin_ducks.jpg/500px-Pair_of_mandarin_ducks.jpg',
  ],
  Rabbit: [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Oryctolagus_cuniculus_Rcdo.jpg/500px-Oryctolagus_cuniculus_Rcdo.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Oryctolagus_cuniculus_-_euqirneto_-_419737670_%28cropped%29.jpeg/500px-Oryctolagus_cuniculus_-_euqirneto_-_419737670_%28cropped%29.jpeg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Eastern_cottontail_%28Sylvilagus_floridanus%29_foraging_on_ground_vegetation.jpg/500px-Eastern_cottontail_%28Sylvilagus_floridanus%29_foraging_on_ground_vegetation.jpg',
  ],
  Monkey: [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/BrownSpiderMonkey_%28edit2%29.jpg/500px-BrownSpiderMonkey_%28edit2%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Japanese_Snow_Monkey_%28Macaque%29_Mother_Grooms_Her_Young.jpg/500px-Japanese_Snow_Monkey_%28Macaque%29_Mother_Grooms_Her_Young.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Capuchin_Costa_Rica.jpg/500px-Capuchin_Costa_Rica.jpg',
  ],
  Horse: [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Horse_007.jpg/500px-Horse_007.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Halterstandingshotarabianone.jpg/500px-Halterstandingshotarabianone.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/289-o-Galant-SWE-71-SH-03.jpg/500px-289-o-Galant-SWE-71-SH-03.jpg',
  ],
  Tiger: [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Bengal_tiger_%28Panthera_tigris_tigris%29_female_3_crop.jpg/500px-Bengal_tiger_%28Panthera_tigris_tigris%29_female_3_crop.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Bengal_tiger_in_Sanjay_Dubri_Tiger_Reserve_December_2024_by_Tisha_Mukherjee_11.jpg/500px-Bengal_tiger_in_Sanjay_Dubri_Tiger_Reserve_December_2024_by_Tisha_Mukherjee_11.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/P.t.altaica_Tomak_Male.jpg/500px-P.t.altaica_Tomak_Male.jpg',
  ],
  Zebra: [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Plains_Zebra_Equus_quagga_cropped.jpg/500px-Plains_Zebra_Equus_quagga_cropped.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Equus_quagga_burchellii_-_Etosha%2C_2014.jpg/500px-Equus_quagga_burchellii_-_Etosha%2C_2014.jpg',
  ],
  Turtle: [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Turtle_diversity.jpg/500px-Turtle_diversity.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Chelonia_mydas_is_going_for_the_air_edit.jpg/500px-Chelonia_mydas_is_going_for_the_air_edit.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Green_sea_turtle_%28Chelonia_mydas%29_Moorea.jpg/500px-Green_sea_turtle_%28Chelonia_mydas%29_Moorea.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Eastern_Box_Turtle2.jpg/500px-Eastern_Box_Turtle2.jpg',
  ],
}

function pickImage(name) {
  const imgs = ANIMAL_IMAGES[name] ?? []
  return imgs.length > 0 ? imgs[Math.floor(Math.random() * imgs.length)] : null
}

function AnimalImage({ name, className = '', fallbackClassName = 'text-6xl' }) {
  return (
    <div
      className={`flex items-center justify-center bg-gradient-to-br from-white via-slate-50 to-slate-100 ${className}`}
      aria-label={name}
    >
      <span className={`${fallbackClassName} select-none drop-shadow-sm`} aria-hidden="true">
        {ANIMAL_EMOJIS[name] ?? '🐾'}
      </span>
    </div>
  )
}

const CARD_COLORS = [
  'bg-pink-100', 'bg-blue-100', 'bg-yellow-100',
  'bg-green-100', 'bg-purple-100', 'bg-orange-100',
]

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5)
}

function pickRound(previousName) {
  const pool = ANIMALS.filter(n => n !== previousName)
  const targetName = pool[Math.floor(Math.random() * pool.length)]
  const distractors = shuffle(ANIMALS.filter(n => n !== targetName))
  const choiceNames = shuffle([targetName, ...distractors.slice(0, 5)])
  const choices = choiceNames.map(name => ({ name, image: pickImage(name) }))
  const target = choices.find(c => c.name === targetName)
  return { target, choices }
}

// ── MODE SELECTION ────────────────────────────────────────────────────────────

function ModeSelect({ onSelect }) {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-10 px-6 py-12">
      <div className="text-center">
        <div className="text-8xl mb-4">🐾</div>
        <h1 className="text-4xl font-black text-slate-800">Animal Game</h1>
        <p className="text-slate-500 mt-2 text-lg">Pick how you want to play!</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-5 w-full max-w-2xl">
        <button
          onClick={() => onSelect('click')}
          className="flex-1 flex flex-col items-center gap-4 bg-white rounded-2xl shadow-md p-8 border-b-4 border-accent-blue hover:shadow-lg active:border-b-0 active:translate-y-1 transition-all group"
        >
          <div className="w-20 h-20 bg-accent-blue/20 text-accent-blue rounded-full flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
            👆
          </div>
          <div className="text-center">
            <div className="font-bold text-xl text-slate-700">Click Mode</div>
            <div className="text-slate-500 mt-1">Find and click the animal!</div>
            <div className="text-xs text-accent-blue font-semibold mt-2">Ages 0–2</div>
          </div>
        </button>

        <button
          onClick={() => onSelect('audio')}
          className="flex-1 flex flex-col items-center gap-4 bg-white rounded-2xl shadow-md p-8 border-b-4 border-primary hover:shadow-lg active:border-b-0 active:translate-y-1 transition-all group"
        >
          <div className="w-20 h-20 bg-primary/20 text-green-600 rounded-full flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
            🎤
          </div>
          <div className="text-center">
            <div className="font-bold text-xl text-slate-700">Say It Mode</div>
            <div className="text-slate-500 mt-1">Name the animal out loud!</div>
            <div className="text-xs text-green-600 font-semibold mt-2">Voice recognition</div>
          </div>
        </button>
      </div>

      <button onClick={() => navigate('/')} className="text-slate-400 text-sm hover:text-slate-600 transition-colors">
        ← Back to Home
      </button>
    </div>
  )
}

// ── CLICK MODE ────────────────────────────────────────────────────────────────

function ClickMode({ onBack }) {
  const [round, setRound] = useState(() => pickRound(null))
  const [feedback, setFeedback] = useState(null)
  const [score, setScore] = useState(0)
  const [total, setTotal] = useState(0)
  const [wrongIdx, setWrongIdx] = useState(null)
  const timeoutRef = useRef(null)
  const { setScore: setSessionScore } = useGameSession('animals')

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setSessionScore(score) }, [score])

  const handlePick = useCallback((animal, idx) => {
    if (feedback) return
    const isCorrect = animal.name === round.target.name
    setTotal(t => t + 1)
    if (isCorrect) {
      setScore(s => s + 1)
      setFeedback('correct')
      timeoutRef.current = setTimeout(() => {
        setFeedback(null)
        setWrongIdx(null)
        setRound(pickRound(round.target.name))
      }, 1400)
    } else {
      setWrongIdx(idx)
      setFeedback('wrong')
      timeoutRef.current = setTimeout(() => {
        setFeedback(null)
        setWrongIdx(null)
      }, 900)
    }
  }, [feedback, round])

  useEffect(() => () => clearTimeout(timeoutRef.current), [])

  return (
    <div className="flex flex-col flex-1 relative">
      <header className="sticky top-0 z-20 flex items-center justify-between px-8 py-4 bg-white/70 backdrop-blur-md border-b border-white/50 shadow-sm">
        <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 bg-white/80 rounded-full shadow-sm hover:bg-white transition-colors">
          <span className="material-symbols-outlined text-slate-500">arrow_back</span>
          <span className="text-sm font-semibold text-slate-600 hidden sm:inline">Modes</span>
        </button>
        <div className="text-center">
          <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">Find the animal!</p>
          <div className="inline-flex items-center bg-white rounded-xl shadow-sm px-5 py-1.5 mt-1">
            <span className="text-2xl font-black text-slate-800">{round.target.name}</span>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm font-bold text-slate-700">
          ⭐ {score} / {total}
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-3xl">
          <div className="grid grid-cols-3 gap-4">
            {round.choices.map((animal, idx) => {
              const isWrong = wrongIdx === idx
              const isTarget = feedback === 'correct' && animal.name === round.target.name
              return (
                <button
                  key={`${animal.name}-${idx}`}
                  onClick={() => handlePick(animal, idx)}
                  className={`
                    flex flex-col items-center justify-center rounded-2xl aspect-square shadow-md overflow-hidden
                    border-b-4 hover:shadow-lg active:border-b-0 active:translate-y-1 transition-all duration-150
                    ${CARD_COLORS[idx % CARD_COLORS.length]}
                    ${isTarget ? 'ring-4 ring-primary scale-105' : ''}
                    ${isWrong ? 'ring-4 ring-red-400 scale-95 opacity-60' : ''}
                    border-black/10
                  `}
                >
                  <AnimalImage
                    name={animal.name}
                    className="w-full h-full"
                    fallbackClassName="text-6xl"
                  />
                </button>
              )
            })}
          </div>
        </div>
      </main>

      {feedback === 'correct' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
          <div className="bg-white rounded-3xl shadow-2xl px-14 py-10 flex flex-col items-center gap-2 animate-bounce-slight">
            <div className="text-7xl">🎉</div>
            <div className="text-3xl font-black text-primary">Great job!</div>
          </div>
        </div>
      )}
      {feedback === 'wrong' && (
        <div className="absolute bottom-16 left-0 right-0 flex justify-center pointer-events-none z-30">
          <div className="bg-white rounded-2xl shadow-lg px-8 py-4 text-slate-600 font-semibold text-lg">
            Try again! 🔍
          </div>
        </div>
      )}
    </div>
  )
}

// ── AUDIO MODE ────────────────────────────────────────────────────────────────

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

function AudioMode({ onBack }) {
  const initialName = ANIMALS[Math.floor(Math.random() * ANIMALS.length)]
  const [animal, setAnimal] = useState(initialName)
  const [currentImage, setCurrentImage] = useState(() => pickImage(initialName))
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [score, setScore] = useState(0)
  const [total, setTotal] = useState(0)
  const recognitionRef = useRef(null)
  const timeoutRef = useRef(null)
  const { setScore: setSessionScore } = useGameSession('animals')

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setSessionScore(score) }, [score])

  const nextAnimal = useCallback(() => {
    setFeedback(null)
    setTranscript('')
    setAnimal(prev => {
      const pool = ANIMALS.filter(n => n !== prev)
      const next = pool[Math.floor(Math.random() * pool.length)]
      setCurrentImage(pickImage(next))
      return next
    })
  }, [])

  const startListening = useCallback(() => {
    if (!SpeechRecognition) { setFeedback('error'); return }
    if (listening) return

    const rec = new SpeechRecognition()
    rec.lang = 'en-US'
    rec.interimResults = false
    rec.maxAlternatives = 3
    recognitionRef.current = rec

    rec.onstart = () => setListening(true)
    rec.onend   = () => setListening(false)

    rec.onresult = (event) => {
      const results = Array.from(event.results[0]).map(r => r.transcript.toLowerCase())
      setTranscript(results[0])
      const correct = results.some(r => r.includes(animal.toLowerCase()))
      setTotal(t => t + 1)
      if (correct) {
        setScore(s => s + 1)
        setFeedback('correct')
        timeoutRef.current = setTimeout(nextAnimal, 1600)
      } else {
        setFeedback('wrong')
        timeoutRef.current = setTimeout(() => setFeedback(null), 1600)
      }
    }

    rec.onerror = (e) => {
      setListening(false)
      if (e.error !== 'no-speech') setFeedback('error')
    }

    rec.start()
  }, [listening, animal, nextAnimal])

  useEffect(() => () => {
    clearTimeout(timeoutRef.current)
    recognitionRef.current?.abort()
  }, [])

  const micColor = listening
    ? 'bg-red-400 shadow-[0_8px_30px_rgba(248,113,113,0.6)]'
    : feedback === 'correct'
    ? 'bg-primary shadow-[0_8px_30px_rgba(25,230,107,0.5)]'
    : 'bg-primary shadow-[0_8px_30px_rgba(25,230,107,0.4)]'

  return (
    <div className="flex flex-col flex-1">
      <header className="sticky top-0 z-20 flex items-center justify-between px-8 py-4 bg-white/70 backdrop-blur-md border-b border-white/50 shadow-sm">
        <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 bg-white/80 rounded-full shadow-sm hover:bg-white transition-colors">
          <span className="material-symbols-outlined text-slate-500">arrow_back</span>
          <span className="text-sm font-semibold text-slate-600 hidden sm:inline">Modes</span>
        </button>
        <h1 className="text-xl font-black text-slate-800">Say It Mode</h1>
        <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm font-bold text-slate-700">
          ⭐ {score} / {total}
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-4xl flex flex-col md:flex-row items-center justify-center gap-12">

          {/* Left: animal photo */}
          <div className="flex flex-col items-center gap-4">
            <p className="text-slate-500 font-medium uppercase tracking-wider text-sm">What animal is this?</p>
            <div className="w-72 h-72 rounded-3xl bg-white shadow-xl overflow-hidden flex items-center justify-center">
              <AnimalImage
                name={animal}
                className="w-full h-full"
                fallbackClassName="text-7xl"
              />
            </div>
          </div>

          {/* Right: mic controls */}
          <div className="flex flex-col items-center gap-5">
            <div className="h-8 text-slate-500 text-lg font-medium text-center">
              {listening && <span className="animate-pulse">Listening…</span>}
              {!listening && transcript && <span>"{transcript}"</span>}
            </div>

            {feedback === 'correct' && (
              <div className="flex items-center gap-2 bg-primary/20 text-green-700 font-bold px-6 py-3 rounded-full text-lg">
                🎉 That's right! It's a {animal}!
              </div>
            )}
            {feedback === 'wrong' && (
              <div className="flex items-center gap-2 bg-red-100 text-red-600 font-bold px-6 py-3 rounded-full text-lg">
                🔄 Try again — say "{animal}"
              </div>
            )}
            {feedback === 'error' && (
              <div className="flex flex-col items-center gap-2 text-slate-500 text-center">
                <span className="text-2xl">🎙️</span>
                <span className="text-sm">Microphone not available in this browser.<br />Please try Chrome or Edge.</span>
              </div>
            )}
            {!feedback && !listening && !transcript && (
              <div className="text-slate-400 text-sm">Click the mic and say the animal name!</div>
            )}

            {listening && (
              <div className="flex items-end gap-1 h-10">
                {[3, 5, 8, 6, 10, 7, 4, 9, 5, 3].map((h, i) => (
                  <div
                    key={i}
                    className="w-2 bg-primary rounded-full animate-pulse"
                    style={{ height: `${h * 4}px`, animationDelay: `${i * 60}ms` }}
                  />
                ))}
              </div>
            )}

            <button
              onClick={startListening}
              disabled={listening || feedback === 'correct'}
              className={`w-28 h-28 rounded-full flex items-center justify-center text-slate-900 transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-60 ${micColor}`}
            >
              <span className="material-symbols-outlined text-[56px] fill-1">
                {listening ? 'mic' : 'mic_none'}
              </span>
            </button>
            <p className="text-slate-400 text-sm">Click to speak</p>

            <button
              onClick={nextAnimal}
              className="text-slate-400 hover:text-slate-600 text-sm underline underline-offset-2 transition-colors"
            >
              Skip this one →
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

// ── ROOT COMPONENT ────────────────────────────────────────────────────────────

export default function AnimalGame() {
  const [mode, setMode] = useState(null)

  return (
    <div className="bg-gradient-to-br from-sky-100 to-green-50 min-h-screen flex flex-col font-display text-slate-900 antialiased">

      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-white/40 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-primary/15 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col flex-1">
        {mode === null && <ModeSelect onSelect={setMode} />}
        {mode === 'click' && <ClickMode onBack={() => setMode(null)} />}
        {mode === 'audio' && <AudioMode onBack={() => setMode(null)} />}
      </div>

    </div>
  )
}
