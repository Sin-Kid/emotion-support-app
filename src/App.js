import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import dotenv from "dotenv";
// dotenv.config();
// Define the scenarios and their options
const scenarios = [
  {
    id: 1,
    question: "You're giving a talk at work, and the computer stops working. What do you do first?",
    options: {
      a: "Quickly fix it or find another way to keep talking.",
      b: "Feel a bit scared but try to stay calm and find a fix.",
      c: "Say sorry a lot and feel your mind go blank, hoping someone else helps.",
      d: "Feel totally lost and can't get calm, even after it's fixed."
    }
  },
  {
    id: 2,
    question: "You planned a big trip, but the day before, all flights stop. What happens next for you?",
    options: {
      a: "Quickly look for other travel ways or change your trip plans.",
      b: "Feel very sad and mad, but start looking for fixes after a bit.",
      c: "Get upset and feel the trip is ruined, can't think what to do.",
      d: "Feel very hopeless and too emotional to think about any fixes."
    }
  },
  {
    id: 3,
    question: "You see a small car crash. No one is badly hurt, but the drivers are shaking and arguing. What's your first thought?",
    options: {
      a: "Check if everyone is okay and offer to help or call for help.",
      b: "Feel a little uneasy but watch from far, ready to help if really needed.",
      c: "Feel worried and try not to look, hoping someone else will take charge.",
      d: "Feel very uneasy and just want to leave the place fast."
    }
  },
  {
    id: 4,
    question: "You get sudden news and must make a big life choice fast, with a lot at stake. How do you decide?",
    options: {
      a: "Get all facts, think about good and bad points, then decide.",
      b: "Feel rushed but try to calmly look at the situation and your choices.",
      c: "Feel too much to handle by the suddenness and can't think clearly.",
      d: "Feel stuck by the choice and worry too much about picking wrong."
    }
  },
  {
    id: 5,
    question: "You're working on a big project, and suddenly a major computer problem happens. What's your first reaction?",
    options: {
      a: "Break down the problem, find fixes, and ask others for help if needed.",
      b: "Feel stressed but stay focused on finding a quick way around or a fix.",
      c: "Feel a wave of anger and worry, making it hard to focus on fixing it.",
      d: "Feel hopeless and the problem seems too big, feeling stuck."
    }
  },
  {
    id: 6,
    question: "Someone you care about is having a very hard time and tells you about it. How do you answer them?",
    options: {
      a: "Listen with care, offer help, and help them find ideas or help places.",
      b: "Feel worried for them and listen kindly, trying to say comforting words.",
      c: "Feel a bit uneasy with their strong feelings and don't know how to help well.",
      d: "Feel too much to handle by their pain and don't know how to help, which makes you feel helpless."
    }
  },
  {
    id: 7,
    question: "You put a lot of money into something, and it suddenly goes down a lot. What's your first thought?",
    options: {
      a: "Look at the situation calmly, think about ways to get money back, and learn from it.",
      b: "Feel a bit sad and worried, but then start thinking about next steps.",
      c: "Feel a knot in your stomach and regret, can't accept the loss.",
      d: "Feel strong worry and fear about money problems, making it hard to think clearly."
    }
  },
  {
    id: 8,
    question: "You are in a crowded, new place and realize you are lost. How do you react?",
    options: {
      a: "Stay calm, take out your phone or ask for directions to find your way.",
      b: "Feel lost for a moment but quickly try to find a known place or someone to ask.",
      c: "Feel a wave of unease and a bit lost, hard to decide what to do next.",
      d: "Feel a rising fear and helplessness, wishing you were not there."
    }
  },
  {
    id: 9,
    question: "You're getting ready for a show or a talk, and suddenly you get very nervous. What do you do?",
    options: {
      a: "Use deep breaths or mind pictures to calm nerves and focus on the task.",
      b: "Know you're nervous but push through it, focusing on what you need to do.",
      c: "Feel your heart racing and hands shaking, making it hard to focus.",
      d: "Feel completely taken over by fear, making it hard to do anything."
    }
  },
  {
    id: 10,
    question: "You find out a close friend has been telling false stories about you. How do you face this?",
    options: {
      a: "Talk to them directly and calmly to discuss the stories and understand why.",
      b: "Feel hurt and betrayed, but plan to talk to them after you've thought about it.",
      c: "Feel very upset and think about staying away from them, hard to face them.",
      d: "Feel a deep sadness and betrayal, leading to bad sleep and trouble moving on."
    }
  },
  {
    id: 11,
    question: "You face a sudden, big change in where you live (like needing to move fast, or friend problems). How do you deal with it?",
    options: {
      a: "Look at the new situation, make a plan, and change easily.",
      b: "Feel a bit unsure by the change but start looking at choices and making adjustments.",
      c: "Feel stressed and too much to handle by the change, hard to get your thoughts in order.",
      d: "Feel like things are not stable and worry, hard to feel safe."
    }
  },
  {
    id: 12,
    question: "You're trying to learn a new, hard skill, and you keep making mistakes. What is your attitude?",
    options: {
      a: "See it as a test, keep trying, and look for new ways to learn or help.",
      b: "Feel a little mad but keep trying to practice and get better.",
      c: "Feel sad and start to doubt if you can learn the new skill.",
      d: "Feel hopeless and want to give up completely because it's too hard."
    }
  },
  {
    id: 13,
    question: "You get comments about your work that feel unfair or mean. How do you take this in?",
    options: {
      a: "Look at the comments calmly, take any good points, and ignore the rest.",
      b: "Feel a bit stung at first but try to think about the comments and learn.",
      c: "Feel hurt and defensive, hard to take the comments.",
      d: "Feel very upset and question your skills, leading to doubting yourself."
    }
  },
  {
    id: 14,
    question: "You are in a situation where you feel people are going too far with you, and you need to speak up. What do you do?",
    options: {
      a: "Clearly and calmly say what you need and stand firm.",
      b: "Feel uneasy but try to politely say you're uncomfortable and set rules.",
      c: "Feel worried about a fight and find it hard to say what you're thinking.",
      d: "Feel scared and let others cross your lines, leading to anger later."
    }
  },
  {
    id: 15,
    question: "You were looking forward to a big event, and at the last minute, it gets canceled. How do you react?",
    options: {
      a: "Know you're disappointed, then find something else to do or make new plans.",
      b: "Feel a bit sad, but then try to use the sudden free time well.",
      c: "Feel a sense of letdown and anger, and can't find something else to do.",
      d: "Feel very disappointed and a lasting sense of sadness, which affects your mood for a while."
    }
  }
];

// Define a mapping of emotional scores for each option in each scenario.
// Scores are relative: 0 = no presence, 1 = mild, 2 = moderate, 3 = strong.
// The keys represent the specific emotions.
const scenarioEmotionScores = {
    // Scenario 1: Projector stops working
    1: {'a': {anxiety: 0, fear: 0, worry: 0, tension: 0, anguish: 0, agony: 0, shock: 0, suffering: 0},
        'b': {anxiety: 1, fear: 0, worry: 1, tension: 1, anguish: 0, agony: 0, shock: 1, suffering: 0},
        'c': {anxiety: 2, fear: 0, worry: 2, tension: 2, anguish: 0, agony: 0, shock: 1, suffering: 0},
        'd': {anxiety: 3, fear: 0, worry: 3, tension: 3, anguish: 1, agony: 0, shock: 2, suffering: 1}},

    // Scenario 2: Airline strike, flights cancelled
    2: {'a': {anxiety: 0, fear: 0, worry: 0, tension: 0, anguish: 0, agony: 0, shock: 0, suffering: 0},
        'b': {anxiety: 1, fear: 0, worry: 1, tension: 1, anguish: 0, agony: 0, shock: 0, suffering: 0},
        'c': {anxiety: 2, fear: 0, worry: 2, tension: 2, anguish: 0, agony: 0, shock: 1, suffering: 0},
        'd': {anxiety: 3, fear: 1, worry: 3, tension: 3, anguish: 2, agony: 0, shock: 1, suffering: 2}},

    // Scenario 3: Car accident, drivers arguing
    3: {'a': {anxiety: 0, fear: 0, worry: 0, tension: 0, anguish: 0, agony: 0, shock: 0, suffering: 0},
        'b': {anxiety: 1, fear: 0, worry: 0, tension: 1, anguish: 0, agony: 0, shock: 0, suffering: 0},
        'c': {anxiety: 2, fear: 1, worry: 1, tension: 2, anguish: 0, agony: 0, shock: 1, suffering: 0},
        'd': {anxiety: 3, fear: 2, worry: 2, tension: 3, anguish: 0, agony: 0, shock: 1, suffering: 0}},

    // Scenario 4: Big life decision, quickly
    4: {'a': {anxiety: 0, fear: 0, worry: 0, tension: 0, anguish: 0, agony: 0, shock: 0, suffering: 0},
        'b': {anxiety: 1, fear: 0, worry: 1, tension: 1, anguish: 0, agony: 0, shock: 0, suffering: 0},
        'c': {anxiety: 2, fear: 0, worry: 2, tension: 2, anguish: 0, agony: 0, shock: 0, suffering: 0},
        'd': {anxiety: 3, fear: 1, worry: 3, tension: 3, anguish: 0, agony: 0, shock: 0, suffering: 0}},

    // Scenario 5: Crucial project, major technical problem
    5: {'a': {anxiety: 0, fear: 0, worry: 0, tension: 0, anguish: 0, agony: 0, shock: 0, suffering: 0},
        'b': {anxiety: 1, fear: 0, worry: 1, tension: 1, anguish: 0, agony: 0, shock: 0, suffering: 0},
        'c': {anxiety: 2, fear: 0, worry: 2, tension: 2, anguish: 0, agony: 0, shock: 0, suffering: 0},
        'd': {anxiety: 3, fear: 0, worry: 3, tension: 3, anguish: 1, agony: 0, shock: 0, suffering: 1}},

    // Scenario 6: Friend confides in you about struggles
    6: {'a': {anxiety: 0, fear: 0, worry: 0, tension: 0, anguish: 0, agony: 0, shock: 0, suffering: 0},
        'b': {anxiety: 0, fear: 0, worry: 0, tension: 0, anguish: 0, agony: 0, shock: 0, suffering: 0},
        'c': {anxiety: 1, fear: 0, worry: 1, tension: 1, anguish: 0, agony: 0, shock: 0, suffering: 0},
        'd': {anxiety: 2, fear: 0, worry: 2, tension: 2, anguish: 1, agony: 0, shock: 0, suffering: 1}},

    // Scenario 7: Investment takes a major downturn
    7: {'a': {anxiety: 0, fear: 0, worry: 0, tension: 0, anguish: 0, agony: 0, shock: 0, suffering: 0},
        'b': {anxiety: 1, fear: 0, worry: 1, tension: 1, anguish: 0, agony: 0, shock: 0, suffering: 0},
        'c': {anxiety: 2, fear: 0, worry: 2, tension: 2, anguish: 0, agony: 0, shock: 1, suffering: 0},
        'd': {anxiety: 3, fear: 1, worry: 3, tension: 3, anguish: 1, agony: 0, shock: 1, suffering: 1}},

    // Scenario 8: Lost in crowded, unfamiliar place
    8: {'a': {anxiety: 0, fear: 0, worry: 0, tension: 0, anguish: 0, agony: 0, shock: 0, suffering: 0},
        'b': {anxiety: 1, fear: 0, worry: 0, tension: 1, anguish: 0, agony: 0, shock: 0, suffering: 0},
        'c': {anxiety: 2, fear: 1, worry: 1, tension: 2, anguish: 0, agony: 0, shock: 0, suffering: 0},
        'd': {anxiety: 3, fear: 3, worry: 2, tension: 3, anguish: 0, agony: 0, shock: 1, suffering: 0}},

    // Scenario 9: Severe nerves before public performance
    9: {'a': {anxiety: 0, fear: 0, worry: 0, tension: 0, anguish: 0, agony: 0, shock: 0, suffering: 0},
        'b': {anxiety: 1, fear: 0, worry: 0, tension: 1, anguish: 0, agony: 0, shock: 0, suffering: 0},
        'c': {anxiety: 2, fear: 1, worry: 1, tension: 2, anguish: 0, agony: 0, shock: 0, suffering: 0},
        'd': {anxiety: 3, fear: 3, worry: 2, tension: 3, anguish: 0, agony: 0, shock: 0, suffering: 0}},

    // Scenario 10: Close friend spreading rumors
    10: {'a': {anxiety: 0, fear: 0, worry: 0, tension: 0, anguish: 0, agony: 0, shock: 0, suffering: 0},
         'b': {anxiety: 0, fear: 0, worry: 1, tension: 0, anguish: 0, agony: 0, shock: 0, suffering: 0},
         'c': {anxiety: 1, fear: 0, worry: 2, tension: 1, anguish: 1, agony: 0, shock: 0, suffering: 1},
         'd': {anxiety: 2, fear: 0, worry: 3, tension: 2, anguish: 2, agony: 1, shock: 0, suffering: 2}},

    // Scenario 11: Sudden change in living situation
    11: {'a': {anxiety: 0, fear: 0, worry: 0, tension: 0, anguish: 0, agony: 0, shock: 0, suffering: 0},
         'b': {anxiety: 1, fear: 0, worry: 1, tension: 1, anguish: 0, agony: 0, shock: 0, suffering: 0},
         'c': {anxiety: 2, fear: 0, worry: 2, tension: 2, anguish: 0, agony: 0, shock: 1, suffering: 0},
         'd': {anxiety: 3, fear: 0, worry: 3, tension: 3, anguish: 0, agony: 0, shock: 1, suffering: 1}},

    // Scenario 12: Failing to grasp new complex skill
    12: {'a': {anxiety: 0, fear: 0, worry: 0, tension: 0, anguish: 0, agony: 0, shock: 0, suffering: 0},
         'b': {anxiety: 0, fear: 0, worry: 1, tension: 0, anguish: 0, agony: 0, shock: 0, suffering: 0},
         'c': {anxiety: 1, fear: 0, worry: 2, tension: 1, anguish: 0, agony: 0, shock: 0, suffering: 0},
         'd': {anxiety: 2, fear: 0, worry: 3, tension: 2, anguish: 1, agony: 0, shock: 0, suffering: 1}},

    // Scenario 13: Unfair/harsh criticism about work
    13: {'a': {anxiety: 0, fear: 0, worry: 0, tension: 0, anguish: 0, agony: 0, shock: 0, suffering: 0},
         'b': {anxiety: 0, fear: 0, worry: 0, tension: 0, anguish: 0, agony: 0, shock: 0, suffering: 0},
         'c': {anxiety: 1, fear: 0, worry: 1, tension: 1, anguish: 0, agony: 0, shock: 0, suffering: 0},
         'd': {anxiety: 2, fear: 0, worry: 2, tension: 2, anguish: 1, agony: 0, shock: 0, suffering: 1}},

    // Scenario 14: Personal boundaries crossed, need to assert self
    14: {'a': {anxiety: 0, fear: 0, worry: 0, tension: 0, anguish: 0, agony: 0, shock: 0, suffering: 0},
         'b': {anxiety: 1, fear: 0, worry: 0, tension: 1, anguish: 0, agony: 0, shock: 0, suffering: 0},
         'c': {anxiety: 2, fear: 1, worry: 1, tension: 2, anguish: 0, agony: 0, shock: 1, suffering: 0},
         'd': {anxiety: 3, fear: 2, worry: 2, tension: 3, anguish: 0, agony: 0, shock: 1, suffering: 1}},

    // Scenario 15: Important event canceled at last minute
    15: {'a': {anxiety: 0, fear: 0, worry: 0, tension: 0, anguish: 0, agony: 0, shock: 0, suffering: 0},
         'b': {anxiety: 0, fear: 0, worry: 0, tension: 0, anguish: 0, agony: 0, shock: 0, suffering: 0},
         'c': {anxiety: 1, fear: 0, worry: 1, tension: 1, anguish: 0, agony: 0, shock: 0, suffering: 0},
         'd': {anxiety: 2, fear: 0, worry: 2, tension: 2, anguish: 0, agony: 0, shock: 0, suffering: 1}},
};


function analyzeSpecificEmotionalProblems(responses) {
    // Initialize total scores for each emotion
    const emotionalTotals = {
        'anxiety': 0,
        'fear': 0,
        'worry': 0,
        'tension': 0,
        'anguish': 0,
        'agony': 0,
        'shock': 0,
        'suffering': 0
    };
    
    let validResponsesCount = 0;

    // Process each response
    responses.forEach((response, index) => {
        const scenarioNum = index + 1;
        const responseLower = response.toLowerCase();

        if (scenarioEmotionScores[scenarioNum] && scenarioEmotionScores[scenarioNum][responseLower]) {
            validResponsesCount++;
            const chosenOptionScores = scenarioEmotionScores[scenarioNum][responseLower];
            // Corrected typo: changed chosen_option_scores to chosenOptionScores
            for (const emotion in chosenOptionScores) {
                if (emotionalTotals.hasOwnProperty(emotion)) {
                    emotionalTotals[emotion] += chosenOptionScores[emotion];
                }
            }
        } else {
            // console.warn(`Invalid response or scenario for scenario ${scenarioNum}: ${response}`);
        }
    });

    // Convert emotion scores to an array of [emotionName, score] pairs
    const sortedEmotions = Object.entries(emotionalTotals).sort(([, scoreA], [, scoreB]) => scoreB - scoreA);

    // Identify the top 1 or 2 emotional problems with a score > 0
    const topProblems = [];
    if (sortedEmotions.length > 0 && sortedEmotions[0][1] > 0) {
        topProblems.push(sortedEmotions[0][0]); // Add the top emotion

        if (sortedEmotions.length > 1 && sortedEmotions[1][1] > 0 && sortedEmotions[1][1] === sortedEmotions[0][1]) {
            // If the second emotion has the same score as the first and score is > 0, add it
            topProblems.push(sortedEmotions[1][0]);
        } else if (sortedEmotions.length > 1 && sortedEmotions[1][1] > 0 && topProblems.length < 2) {
             // If there's a distinct second highest score that's > 0, and we only have one top problem so far
             topProblems.push(sortedEmotions[1][0]);
        }
    }
    // If there's a tie for the second place, and we only have one top problem,
    // find the next highest score and add it if it's different from the first highest.
    if (topProblems.length === 1 && sortedEmotions.length > 1) {
        let nextHighestScore = -1;
        let nextProblem = null;
        for (let i = 1; i < sortedEmotions.length; i++) {
            if (sortedEmotions[i][1] > 0 && sortedEmotions[i][0] !== topProblems[0]) {
                if (nextProblem === null || sortedEmotions[i][1] === nextHighestScore) {
                    nextHighestScore = sortedEmotions[i][1];
                    topProblems.push(sortedEmotions[i][0]);
                    if (topProblems.length === 2) break; // We found our two
                }
            }
        }
    }
    // Ensure we don't return more than 2 problems in case of very complex ties
    const finalTopProblems = topProblems.slice(0, 2);


    // Craft the final assessment message
    let assessmentMessage = "";
    if (finalTopProblems.length === 0) {
        assessmentMessage = (
            "Based on your responses, you seem to generally cope well with stress and " +
            "may not be facing significant emotional challenges from this list. " +
            "You appear calm and capable in challenging situations."
        );
    } else if (finalTopProblems.length === 1) {
        const problemName = finalTopProblems[0].replace(/_/g, ' ');
        assessmentMessage = (
            `Based on your responses, you seem to be most affected by **${problemName}**.` +
            " You might feel this when things are difficult or uncertain."
        );
    } else { // Exactly 2 problems
        const problem1Name = finalTopProblems[0].replace(/_/g, ' ');
        const problem2Name = finalTopProblems[1].replace(/_/g, ' ');
        assessmentMessage = (
            `Based on your responses, you seem to be most affected by **${problem1Name}** ` +
            `and **${problem2Name}**. You might experience these feelings when dealing ` +
            "with difficult or surprising situations."
        );
    }

    return {
        emotionalScores: emotionalTotals,
        identifiedProblems: finalTopProblems,
        assessment: assessmentMessage,
        validResponsesCount: validResponsesCount
    };
}

// Map emotions to suggested exercises/videos
const exerciseSuggestions = {
    'anxiety': {
        title: "Calming Breathing & Gentle Yoga",
        description: "Deep breathing exercises and gentle yoga poses can help calm the nervous system and reduce feelings of anxiety.",
        exercises: [
            { name: "Diaphragmatic Breathing (Belly Breathing)", video: "./videos/diaphragmatic_breathing.mp4" },
            { name: "Child's Pose (Balasana)", video: "./videos/childs_pose.mp4" }
        ]
    },
    'fear': {
        title: "Grounding Techniques & Mindful Movement",
        description: "Grounding exercises help bring focus to the present, while mindful movement can help release physical tension associated with fear.",
        exercises: [
            { name: "5-4-3-2-1 Grounding Technique", video: "./videos/grounding_technique.mp4" },
            { name: "Gentle Cat-Cow Stretch", video: "./videos/cat_cow.mp4" }
        ]
    },
    'worry': {
        title: "Focused Breathing & Restorative Yoga",
        description: "Mindful breathing helps manage thoughts, and restorative yoga can ease mental tension and promote relaxation.",
        exercises: [
            { name: "Box Breathing (4-4-4-4)", video: "./videos/box_breathing.mp4" },
            { name: "Legs-Up-The-Wall (Viparita Karani)", video: "./videos/legs_up_wall.mp4" }
        ]
    },
    'tension': {
        title: "Progressive Muscle Relaxation & Stretching",
        description: "Releasing physical tension through controlled relaxation and stretching can alleviate muscular discomfort.",
        exercises: [
            { name: "Progressive Muscle Relaxation", video: "./videos/pmr.mp4" },
            { name: "Neck and Shoulder Rolls", video: "./videos/neck_shoulder_rolls.mp4" }
        ]
    },
    'anguish': {
        title: "Compassionate Breathing & Restorative Poses",
        description: "When experiencing deep anguish, focusing on compassionate breathing and comforting, gentle yoga poses can provide solace.",
        exercises: [
            { name: "Loving-Kindness Meditation (Short)", video: "./videos/loving_kindness.mp4" },
            { name: "Supported Bridge Pose", video: "./videos/supported_bridge.mp4" }
        ]
    },
    'agony': {
        title: "Mindful Presence & Gentle Movement",
        description: "During intense emotional agony, finding moments of mindful presence and engaging in very gentle, deliberate movements can help process the intensity.",
        exercises: [
            { name: "Body Scan Meditation", video: "./videos/body_scan.mp4" },
            { name: "Slight Spinal Twist (Supine)", video: "./videos/supine_twist.mp4" }
        ]
    },
    'shock': {
        title: "Stabilizing Breathing & Grounding",
        description: "After a shock, stabilizing breathing and grounding techniques are crucial for re-establishing a sense of safety and presence.",
        exercises: [
            { name: "Slow, Deep Breaths (Counting)", video: "./videos/slow_deep_breaths.mp4" },
            { name: "Foot Grounding Exercise", video: "./videos/foot_grounding.mp4" }
        ]
    },
    'suffering': {
        title: "Self-Compassion Practices & Gentle Stretches",
        description: "For ongoing suffering, cultivating self-compassion and engaging in mild stretches can offer comfort and a pathway to ease.",
        exercises: [
            { name: "Self-Compassion Break", video: "./videos/self_compassion_break.mp4" },
            { name: "Seated Forward Fold (Gentle)", video: "./videos/seated_forward_fold.mp4" }
        ]
    }
};

const App = () => {
    // New state to manage the initial landing page visibility
    const [showLandingPage, setShowLandingPage] = useState(true);

    // Local authentication state variables
    const [userId, setUserId] = useState(null); // Will store the username
    const [isLoggedIn, setIsLoggedIn] = useState(false); // To track login status
    const [usernameInput, setUsernameInput] = useState(''); // Input field for username
    const [passwordInput, setPasswordInput] = useState(''); // Input field for password
    const [currentPage, setCurrentPage] = useState('login'); // 'login', 'register', 'survey', 'progress', 'checkin', 'chatbot'

    // App specific state variables
    const [currentAnswers, setCurrentAnswers] = useState({});
    const [analysisResult, setAnalysisResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showAnalysis, setShowAnalysis] = useState(false);
    const [userPastResults, setUserPastResults] = useState([]);
    const [showPastResults, setShowPastResults] = useState(false);
    const [submissionMessage, setSubmissionMessage] = useState('');
    
    // AI Agent specific state variables
    const [aiAgentResponse, setAiAgentResponse] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [generatedExercisePlan, setGeneratedExercisePlan] = useState('');
    const [isExerciseLoading, setIsExerciseLoading] = useState(false);
    const [additionalHelp, setAdditionalHelp] = useState(null);
    const [isHelpLoading, setIsHelpLoading] = useState(false);
    const [recommendedVideos, setRecommendedVideos] = useState([]);
    const [isVideoLoading, setIsVideoLoading] = useState(false);

    // Chatbot specific state variables
    const [chatHistory, setChatHistory] = useState([]);
    const [chatInput, setChatInput] = useState('');

    // Daily Check-in specific state variables
    const [dailyMood, setDailyMood] = useState(3); // Default to middle mood
    const [dailyCheckIns, setDailyCheckIns] = useState([]);

    // Dark Mode state
    const [isDarkMode, setIsDarkMode] = useState(() => {
        // Initialize dark mode from localStorage or default to false
        const savedMode = localStorage.getItem('darkMode');
        return savedMode ? JSON.parse(savedMode) : false;
    });

    // --- Local Storage Keys ---
    const USERS_DATA_KEY = 'emotionAnalyzerUsers'; // Stores all user credentials
    const LOGGED_IN_USER_KEY = 'loggedInUser'; // Stores currently logged in username

    // Video recommendations mapping
    const videoRecommendations = {
        anxiety: ['box_breathing.mp4', 'grounding_technique.mp4', 'body_scan.mp4'],
        stress: ['slow_deep_breaths.mp4', 'neck_shoulder_rolls.mp4', 'cat_cow.mp4'],
        depression: ['loving_kindness.mp4', 'self_compassion_break.mp4', 'legs_up_wall.mp4'],
        anger: ['diaphragmatic_breathing.mp4', 'seated_forward_fold.mp4', 'supine_twist.mp4'],
        fear: ['foot_grounding.mp4', 'box_breathing.mp4', 'body_scan.mp4'],
        sadness: ['loving_kindness.mp4', 'self_compassion_break.mp4', 'supported_bridge.mp4'],
        overwhelm: ['slow_deep_breaths.mp4', 'grounding_technique.mp4', 'childs_pose.mp4'],
        tension: ['neck_shoulder_rolls.mp4', 'cat_cow.mp4', 'supine_twist.mp4']
    };

    // Video descriptions
    const videoDescriptions = {
        'box_breathing.mp4': 'A calming breathing technique to reduce anxiety and stress',
        'grounding_technique.mp4': 'A mindfulness exercise to help you stay present and centered',
        'body_scan.mp4': 'A guided meditation to release tension and promote relaxation',
        'slow_deep_breaths.mp4': 'Deep breathing exercise to calm the nervous system',
        'neck_shoulder_rolls.mp4': 'Gentle movement to release tension in the neck and shoulders',
        'cat_cow.mp4': 'A gentle yoga sequence to improve spinal flexibility',
        'loving_kindness.mp4': 'A meditation practice to cultivate compassion and positive emotions',
        'self_compassion_break.mp4': 'A guided practice to develop self-compassion',
        'legs_up_wall.mp4': 'A restorative yoga pose to reduce stress and anxiety',
        'diaphragmatic_breathing.mp4': 'Deep breathing technique to promote relaxation',
        'seated_forward_fold.mp4': 'A calming forward fold to release tension',
        'supine_twist.mp4': 'A gentle twist to release tension and improve digestion',
        'foot_grounding.mp4': 'A grounding exercise to help you feel more centered',
        'supported_bridge.mp4': 'A restorative pose to open the heart and calm the mind',
        'childs_pose.mp4': 'A restful pose to calm the mind and release tension'
    };

    // --- Effect to apply dark mode class and save preference ---
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    }, [isDarkMode]);

    // --- Mock Hashing for Passwords (VERY INSECURE, FOR DEMO ONLY) ---
    // In a real app, use a secure server-side hashing library like bcrypt.
    const hashPasswordMock = (password) => btoa(password); // Base64 encoding
    const comparePasswordMock = (inputPassword, storedHash) => hashPasswordMock(inputPassword) === storedHash;

    // --- Load User Results from Local Storage (defined first) ---
    const loadUserResults = useCallback((currentUserId) => {
        if (!currentUserId) {
            console.error("User ID not available for loading results from local storage.");
            return;
        }
        setIsLoading(true);
        try {
            const users = JSON.parse(localStorage.getItem(USERS_DATA_KEY) || '{}');
            const user = users[currentUserId];

            if (user && user.results) {
                // Ensure timestamps are Date objects for sorting
                const loaded = user.results.map(result => ({
                    ...result,
                    timestamp: new Date(result.timestamp)
                }));
                // Sort results by timestamp in descending order (most recent first)
                loaded.sort((a, b) => b.timestamp - a.timestamp);
                setUserPastResults(loaded);
                // Filter and set daily check-ins
                const loadedDailyCheckIns = loaded.filter(res => res.type === 'dailyCheckIn');
                setDailyCheckIns(loadedDailyCheckIns);

                // Find the latest survey analysis
                const latestSurvey = loaded.find(res => res.type === 'survey');
                if (latestSurvey) {
                    setAnalysisResult(latestSurvey.analysisData); // Assuming analysisData key holds the full analysis object
                    setShowAnalysis(true); // Automatically show analysis if past one exists
                }


            } else {
                setUserPastResults([]);
                setDailyCheckIns([]);
            }
            setShowPastResults(false); // Hide initially, user can click to view
            setSubmissionMessage(''); // Clear message
            console.log("Past results loaded from local storage!");
        } catch (error) {
            console.error("Error loading past survey results from local storage:", error.message);
            setSubmissionMessage(`Error loading past results: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    }, []); // Empty dependency array as its internal dependencies are stable

    // --- Effect to check for existing login on mount ---
    useEffect(() => {
        setIsLoading(true);
        const storedUserId = localStorage.getItem(LOGGED_IN_USER_KEY);
        if (storedUserId) {
            setUserId(storedUserId);
            setIsLoggedIn(true);
            setShowLandingPage(false); // Bypass landing page if already logged in
            setCurrentPage('survey'); // Go directly to survey if logged in
            setUsernameInput(storedUserId); // Pre-fill username input
            loadUserResults(storedUserId); // Load past results for the logged-in user
        } else {
            setShowLandingPage(true); // Show landing page if not logged in
            setCurrentPage('login'); // Default to login page after landing
        }
        setIsLoading(false);
    }, [loadUserResults]); // Added loadUserResults to dependency array


    // --- Local Register Handler ---
    const handleRegister = (e) => {
        e.preventDefault();
        setSubmissionMessage('');
        setIsLoading(true);

        const newUsername = usernameInput.trim();
        const newPassword = passwordInput.trim();

        if (!newUsername || !newPassword) {
            setSubmissionMessage("Please enter both username and password.");
            setIsLoading(false);
            return;
        }

        let users = JSON.parse(localStorage.getItem(USERS_DATA_KEY) || '{}');

        if (users[newUsername]) {
            setSubmissionMessage("Username already exists. Please choose a different one or log in.");
            setIsLoading(false);
            return;
        }

        // Store user with hashed password and an empty array for results
        users[newUsername] = { password: hashPasswordMock(newPassword), results: [] };
        localStorage.setItem(USERS_DATA_KEY, JSON.stringify(users));

        setSubmissionMessage("Registration successful! You can now log in.");
        setUsernameInput('');
        setPasswordInput('');
        setCurrentPage('login'); // Go to login page after registration
        setIsLoading(false);
    };


    // --- Local Login Handler ---
    const handleLogin = (e) => {
        e.preventDefault();
        setSubmissionMessage('');
        setIsLoading(true);

        const enteredUsername = usernameInput.trim();
        const enteredPassword = passwordInput.trim();

        if (!enteredUsername || !enteredPassword) {
            setSubmissionMessage("Please enter both username and password.");
            setIsLoading(false);
            return;
        }

        const users = JSON.parse(localStorage.getItem(USERS_DATA_KEY) || '{}');
        const user = users[enteredUsername];

        if (user && comparePasswordMock(enteredPassword, user.password)) {
            localStorage.setItem(LOGGED_IN_USER_KEY, enteredUsername); // Store logged in user
            setUserId(enteredUsername);
            setIsLoggedIn(true);
            setShowLandingPage(false); // Hide landing page after successful login
            setCurrentPage('survey'); // Go to survey page
            loadUserResults(enteredUsername);
            setSubmissionMessage(`Welcome back, ${enteredUsername}!`);
        } else {
            setSubmissionMessage("Invalid username or password.");
        }
        setIsLoading(false);
    };

    // --- Local Logout Handler ---
    const handleLogout = () => {
        setIsLoading(true);
        try {
            localStorage.removeItem(LOGGED_IN_USER_KEY); // Remove logged in user from local storage
            setUserId(null);
            setIsLoggedIn(false);
            setUsernameInput(''); // Clear username input
            setPasswordInput(''); // Clear password input
            setAnalysisResult(null); // Clear analysis
            setShowAnalysis(false);
            setUserPastResults([]); // Clear past results
            setDailyCheckIns([]); // Clear daily check-ins
            setShowPastResults(false);
            setCurrentAnswers({}); // Reset survey answers
            setSubmissionMessage('You have been logged out.');
            setShowLandingPage(true); // Show landing page after logout
            setCurrentPage('login'); // Go back to login page
            setChatHistory([]); // Clear chat history
            setAiAgentResponse(''); // Clear AI response
            setGeneratedExercisePlan(''); // Clear generated exercises
            setAdditionalHelp(null); // Clear additional help
        } catch (error) {
            console.error("Error during local logout:", error.message);
            setSubmissionMessage(`Logout failed: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // --- Handle Survey Answer Change ---
    const handleAnswerChange = useCallback((scenarioId, option) => {
        setCurrentAnswers(prevAnswers => ({
            ...prevAnswers,
            [scenarioId]: option
        }));
        setSubmissionMessage(''); // Clear message when answers change
    }, []);

    // --- Save User Results to Local Storage ---
    const saveUserResults = useCallback(async (dataToSave, type) => {
        if (!userId) {
            console.error("User ID not available for saving results to local storage.");
            setSubmissionMessage("Error: Could not save results. Please ensure you are logged in.");
            return;
        }
        setIsLoading(true);
        try {
            let users = JSON.parse(localStorage.getItem(USERS_DATA_KEY) || '{}');
            if (!users[userId]) {
                users[userId] = { password: '', results: [] };
            }

            const record = {
                type: type,
                timestamp: new Date().toISOString(),
            };

            if (type === 'survey') {
                record.responses = dataToSave.responses;
                record.analysisData = dataToSave.analysis; // Store the full analysis object
            } else if (type === 'dailyCheckIn') {
                record.mood = dataToSave.mood;
            }

            users[userId].results.push(record);
            localStorage.setItem(USERS_DATA_KEY, JSON.stringify(users));

            setSubmissionMessage("Your responses/check-in have been saved locally!");
            console.log(`${type} results saved successfully to local storage!`);
            loadUserResults(userId); // Refresh past results after saving

        } catch (error) {
            console.error(`Error saving ${type} results to local storage:`, error.message);
            setSubmissionMessage(`Error saving results: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [userId, loadUserResults]);

    // --- Handle Survey Submission ---
    const handleSubmitSurvey = async (e) => {
        e.preventDefault();
        setSubmissionMessage('');
        
        if (!userId) {
            setSubmissionMessage("Please log in to submit your survey.");
            return;
        }

        const allAnswered = scenarios.every(scenario => currentAnswers.hasOwnProperty(scenario.id));
        if (!allAnswered) {
            setSubmissionMessage("Please answer all questions before submitting.");
            return;
        }

        setIsLoading(true);
        try {
            const userResponsesList = scenarios.map(s => currentAnswers[s.id]);
            const analysis = analyzeSpecificEmotionalProblems(userResponsesList);
            setAnalysisResult(analysis);
            setShowAnalysis(true);
            setAiAgentResponse(''); // Clear previous AI response
            setGeneratedExercisePlan('');
            setAdditionalHelp(null);
            setRecommendedVideos([]); // Clear previous video recommendations

            // Generate video recommendations based on emotional scores
            const topEmotions = Object.entries(analysis.emotionalScores)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 2)
                .map(([emotion]) => emotion);

            const recommendedVideosList = [];
            topEmotions.forEach(emotion => {
                if (videoRecommendations[emotion]) {
                    videoRecommendations[emotion].forEach(video => {
                        if (!recommendedVideosList.includes(video)) {
                            recommendedVideosList.push(video);
                        }
                    });
                }
            });

            setRecommendedVideos(recommendedVideosList.slice(0, 3)); // Show top 3 most relevant videos

            await saveUserResults({ responses: currentAnswers, analysis: analysis }, 'survey');
            
        } catch (error) {
            console.error("Error during survey submission or analysis:", error.message);
            setSubmissionMessage(`An error occurred: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // --- Handle Daily Check-in Submission ---
    const handleDailyCheckIn = async () => {
        if (!userId) {
            setSubmissionMessage("Please log in to submit your daily check-in.");
            return;
        }
        setSubmissionMessage('');
        setIsLoading(true);

        const today = new Date().toISOString().split('T')[0]; // Get today's date inYYYY-MM-DD format
        const alreadyCheckedInToday = dailyCheckIns.some(checkIn => 
            new Date(checkIn.timestamp).toISOString().split('T')[0] === today && checkIn.type === 'dailyCheckIn'
        );

        if (alreadyCheckedInToday) {
            setSubmissionMessage("You have already checked in today! Come back tomorrow.");
            setIsLoading(false);
            return;
        }

        try {
            await saveUserResults({ mood: dailyMood }, 'dailyCheckIn');
            setSubmissionMessage("Daily mood checked in successfully!");
        } catch (error) {
            console.error("Error submitting daily check-in:", error.message);
            setSubmissionMessage(`Error checking in mood: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };


    // --- Generic AI Call Function ---
    const callGeminiApi = useCallback(async (prompt) => {
        let chatHistoryArray = [];
        chatHistoryArray.push({ role: "user", parts: [{ text: prompt }] });
        const payload = { contents: chatHistoryArray };
        const apiKey = process.env.API_KEY; 
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                return result.candidates[0].content.parts[0].text;
            } else {
                console.error("AI response structure unexpected:", result);
                return "Could not get a meaningful response from the AI.";
            }
        } catch (error) {
            console.error("Error calling AI agent:", error);
            return "Failed to connect to the AI. Please check your internet connection or API key.";
        }
    }, []);

    // --- Handle AI Chat Message ---
    const handleChatSubmit = async (e) => {
        e.preventDefault();
        if (!chatInput.trim()) return;

        const newUserMessage = { role: 'user', text: chatInput };
        setChatHistory(prev => [...prev, newUserMessage]);
        setChatInput('');
        setIsAiLoading(true);

        // Construct prompt for the general chatbot, providing context from latest survey if available
        const lastSurveyAnalysis = analysisResult ? `Their latest emotional assessment was: "${analysisResult.assessment}". Their most prominent emotional areas identified were: ${analysisResult.identifiedProblems.join(', ')}.` : 'No recent emotional survey data available for this user.';
        
        const prompt = `You are a supportive AI assistant. The user says: "${newUserMessage.text}". ${lastSurveyAnalysis} Respond in a helpful, empathetic, and conversational manner, keeping your answer concise (2-4 sentences). You can offer encouragement or general advice. Avoid asking questions unless necessary for clarification.`;

        try {
            const aiText = await callGeminiApi(prompt);
            setChatHistory(prev => [...prev, { role: 'ai', text: aiText }]);
        } catch (error) {
            setChatHistory(prev => [...prev, { role: 'ai', text: "Sorry, I'm having trouble connecting right now." }]);
        } finally {
            setIsAiLoading(false);
        }
    };


    // --- Generate Personalized Exercises (AI) ---
    const handleGenerateExercises = async () => {
        if (!analysisResult || analysisResult.identifiedProblems.length === 0) {
            setSubmissionMessage("Please complete the survey first to get personalized exercises.");
            return;
        }
        setIsExerciseLoading(true);
        setGeneratedExercisePlan('');
        setSubmissionMessage('');

        const problemNames = analysisResult.identifiedProblems.map(p => p.replace(/_/g, ' ')).join(' and ');
        const prompt = `Based on the user's identified emotional challenges (${problemNames}) and the assessment "${analysisResult.assessment}", suggest one simple breathing exercise and one gentle yoga pose. Describe each briefly (1-2 sentences) and explain how it helps. Format as: "Breathing Exercise: [Name] - [Description]. Yoga Pose: [Name] - [Description]."`;

        try {
            const plan = await callGeminiApi(prompt);
            setGeneratedExercisePlan(plan);
        } finally {
            setIsExerciseLoading(false);
        }
    };

    // --- Generate Additional Help ---
    const handleGenerateAdditionalHelp = async () => {
        if (!analysisResult || analysisResult.identifiedProblems.length === 0) {
            setSubmissionMessage("Please complete the survey first to get additional help.");
            return;
        }
        setIsHelpLoading(true);
        setAdditionalHelp(null);
        setSubmissionMessage('');

        try {
            // Get top 2 emotions with highest scores
            const topEmotions = Object.entries(analysisResult.emotionalScores)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 2)
                .map(([emotion]) => emotion);

            const emotionNames = topEmotions.map(e => e.replace(/_/g, ' ')).join(' and ');
            
            // Generate poem
            const poemPrompt = `Write a short, uplifting poem (4-6 lines) about overcoming ${emotionNames}. Make it inspiring and hopeful.`;
            const poem = await callGeminiApi(poemPrompt);

            // Generate motivational message
            const motivationPrompt = `Write a brief, powerful motivational message (2-3 sentences) for someone dealing with ${emotionNames}. Make it encouraging and practical.`;
            const motivation = await callGeminiApi(motivationPrompt);

            // Generate podcast recommendations
            const podcastPrompt = `Suggest 2-3 specific podcast episodes or series that help with ${emotionNames}. Include the podcast name, episode title, and a brief description of why it's helpful. Format as a list.`;
            const podcasts = await callGeminiApi(podcastPrompt);

            setAdditionalHelp({
                poem,
                motivation,
                podcasts
            });
        } finally {
            setIsHelpLoading(false);
        }
    };

    // --- Reset Survey and AI interactions ---
    const resetSurvey = () => {
        setCurrentAnswers({});
        setAnalysisResult(null);
        setShowAnalysis(false);
        setSubmissionMessage('');
        setAiAgentResponse('');
        setGeneratedExercisePlan('');
        setAdditionalHelp(null);
        setRecommendedVideos([]);
    };

    // Prepare data for charts
    // Ensure we only process survey results for the emotional scores
    const latestSurveyResult = userPastResults.find(r => r.type === 'survey');
    const emotionalScoreData = latestSurveyResult && latestSurveyResult.analysisData ? Object.entries(latestSurveyResult.analysisData.emotionalScores).map(([emotion, score]) => ({
        name: emotion.charAt(0).toUpperCase() + emotion.slice(1), // Capitalize
        score: score
    })).sort((a,b) => b.score - a.score) : [];

    // Ensure we only process daily check-in results for mood trend
    const moodTrendData = dailyCheckIns.filter(checkIn => checkIn.type === 'dailyCheckIn').map(checkIn => ({
        date: new Date(checkIn.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), // e.g., "Jun 7"
        mood: checkIn.mood
    })).reverse(); // Show newest first

    // --- UI Rendering ---
    if (isLoading && !isLoggedIn && currentPage !== 'login' && currentPage !== 'register' && !showLandingPage) {
        return (
            <div className={`flex justify-center items-center h-screen font-sans ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-800'}`}>
                <div className="text-center text-lg p-8 rounded-lg shadow-md bg-white dark:bg-gray-800">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                    Loading application...
                </div>
            </div>
        );
    }

    // --- Landing Page ---
    if (showLandingPage) {
        return (
            <div className={`relative flex flex-col justify-center items-center min-h-screen p-4 font-sans text-center transition-colors duration-500
                ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'}`}>
                <div className="absolute top-4 right-4">
                    <button
                        onClick={() => setIsDarkMode(prev => !prev)}
                        className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow-md transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    >
                        {isDarkMode ? (
                            // Sun Icon with rays
                            <svg 
                                className="w-6 h-6 transform transition-transform duration-500 hover:rotate-45" 
                                fill="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <circle cx="12" cy="12" r="5" />
                                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" 
                                    stroke="currentColor" 
                                    strokeWidth="2" 
                                    strokeLinecap="round"
                                />
                            </svg>
                        ) : (
                            // Moon Icon with stars
                            <svg 
                                className="w-6 h-6 transform transition-transform duration-500 hover:rotate-45" 
                                fill="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                                <circle cx="18" cy="6" r="1" />
                                <circle cx="19" cy="3" r="1" />
                                <circle cx="16" cy="4" r="1" />
                            </svg>
                        )}
                    </button>
                </div>
                <div className="bg-white dark:bg-gray-800 p-8 md:p-12 rounded-xl shadow-2xl max-w-2xl w-full transform transition-all duration-500 scale-95 hover:scale-100 ease-in-out">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-indigo-700 dark:text-indigo-300 mb-6 animate-pulse-slow">
                        MindCare Platform
                    </h1>
                    <p className="text-lg md:text-xl text-gray-700 dark:text-gray-200 mb-8 max-w-prose mx-auto">
                        Your personalized journey to emotional well-being.
                        Understand, track, and improve your emotional health with AI-powered insights and tools.
                    </p>
                    <button
                        onClick={() => setShowLandingPage(false)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transform transition duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-lg md:text-xl animate-bounce-once"
                    >
                        Get Started
                    </button>
                </div>
            </div>
        );
    }


    // Login/Register Page
    if (currentPage === 'login' || currentPage === 'register') {
        return (
            <div className={`relative flex justify-center items-center min-h-screen p-4 font-sans ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gradient-to-br from-indigo-500 to-purple-600'}`}>
                 <div className="absolute top-4 right-4">
                    <button
                        onClick={() => setIsDarkMode(prev => !prev)}
                        className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow-md transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    >
                        {isDarkMode ? (
                            // Sun Icon with rays
                            <svg 
                                className="w-6 h-6 transform transition-transform duration-500 hover:rotate-45" 
                                fill="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <circle cx="12" cy="12" r="5" />
                                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" 
                                    stroke="currentColor" 
                                    strokeWidth="2" 
                                    strokeLinecap="round"
                                />
                            </svg>
                        ) : (
                            // Moon Icon with stars
                            <svg 
                                className="w-6 h-6 transform transition-transform duration-500 hover:rotate-45" 
                                fill="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                                <circle cx="18" cy="6" r="1" />
                                <circle cx="19" cy="3" r="1" />
                                <circle cx="16" cy="4" r="1" />
                            </svg>
                        )}
                    </button>
                </div>
                <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl text-center max-w-md w-full transition-colors duration-200">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 rounded-md px-4 py-2">
                        {currentPage === 'login' ? 'Login' : 'Register'}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 mb-8">
                        {currentPage === 'login' ? 'Access your survey results.' : 'Create a new account.'}
                    </p>
                    <form onSubmit={currentPage === 'login' ? handleLogin : handleRegister} className="space-y-4">
                        <input
                            type="text"
                            value={usernameInput}
                            onChange={(e) => setUsernameInput(e.target.value)}
                            placeholder="Username"
                            className="w-full p-3 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                            required
                        />
                        <input
                            type="password"
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                            placeholder="Password"
                            className="w-full p-3 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                            required
                        />
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transform transition duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center justify-center w-full disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : currentPage === 'login' ? 'Login' : 'Register'}
                        </button>
                    </form>
                    {submissionMessage && (
                        <p className={`mt-4 text-sm ${submissionMessage.includes('successful') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{submissionMessage}</p>
                    )}
                    <button
                        onClick={() => setCurrentPage(currentPage === 'login' ? 'register' : 'login')}
                        className="mt-6 text-indigo-600 dark:text-indigo-400 hover:underline text-sm transition-colors duration-200"
                    >
                        {currentPage === 'login' ? 'Need an account? Register here.' : 'Already have an account? Login here.'}
                    </button>
                </div>
            </div>
        );
    }


    // Main App Pages
    return (
        <div className={`min-h-screen font-sans p-4 md:p-8 flex justify-center ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gradient-to-br from-blue-100 to-indigo-200 text-gray-800'}`}>
            <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 md:p-10 transition-colors duration-200">

                {/* Header and User Info */}
                <header className="mb-8 pb-4 border-b-2 border-indigo-300 dark:border-indigo-700 flex flex-col md:flex-row justify-between items-center">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-indigo-700 dark:text-indigo-300 mb-4 md:mb-0">
                        MindCare Platform
                    </h1>
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        {isLoggedIn && userId && (
                            <div className="text-right text-sm text-gray-600 dark:text-gray-300">
                                <p className="font-semibold">Welcome:</p>
                                <p>{userId}</p>
                            </div>
                        )}
                        <button
                            onClick={() => setIsDarkMode(prev => !prev)}
                            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow-md transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                        >
                            {isDarkMode ? (
                                // Sun Icon with rays
                                <svg 
                                    className="w-6 h-6 transform transition-transform duration-500 hover:rotate-45" 
                                    fill="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <circle cx="12" cy="12" r="5" />
                                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" 
                                        stroke="currentColor" 
                                        strokeWidth="2" 
                                        strokeLinecap="round"
                                    />
                                </svg>
                            ) : (
                                // Moon Icon with stars
                                <svg 
                                    className="w-6 h-6 transform transition-transform duration-500 hover:rotate-45" 
                                    fill="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                                    <circle cx="18" cy="6" r="1" />
                                    <circle cx="19" cy="3" r="1" />
                                    <circle cx="16" cy="4" r="1" />
                                </svg>
                            )}
                        </button>
                        <button
                            onClick={handleLogout}
                            disabled={isLoading}
                            className="bg-red-500 hover:bg-red-600 text-white text-xs font-semibold py-1.5 px-3 rounded-md shadow transition duration-200"
                        >
                            Log Out
                        </button>
                    </div>
                </header>

                {/* Navigation Buttons for sections */}
                <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8">
                    <button
                        onClick={() => setCurrentPage('survey')}
                        className={`flex-1 sm:flex-none py-2 px-3 sm:px-4 rounded-md font-semibold text-sm sm:text-base transition-colors duration-200 ${
                            currentPage === 'survey' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600'
                        }`}
                    >
                        Emotional Survey
                    </button>
                    <button
                        onClick={() => setCurrentPage('progress')}
                        className={`flex-1 sm:flex-none py-2 px-3 sm:px-4 rounded-md font-semibold text-sm sm:text-base transition-colors duration-200 ${
                            currentPage === 'progress' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600'
                        }`}
                    >
                        View Progress
                    </button>
                    <button
                        onClick={() => setCurrentPage('checkin')}
                        className={`flex-1 sm:flex-none py-2 px-3 sm:px-4 rounded-md font-semibold text-sm sm:text-base transition-colors duration-200 ${
                            currentPage === 'checkin' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600'
                        }`}
                    >
                        Daily Check-in
                    </button>
                    <button
                        onClick={() => setCurrentPage('chatbot')}
                        className={`flex-1 sm:flex-none py-2 px-3 sm:px-4 rounded-md font-semibold text-sm sm:text-base transition-colors duration-200 ${
                            currentPage === 'chatbot' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600'
                        }`}
                    >
                        Chat with AI
                    </button>
                </div>


                {/* Submission Message */}
                {submissionMessage && (
                    <div className={`mt-6 p-4 rounded-md text-center text-sm font-medium ${submissionMessage.includes('Error') || submissionMessage.includes('failed') ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'}`}>
                        {submissionMessage}
                    </div>
                )}

                {/* Conditional Rendering based on currentPage */}
                {currentPage === 'survey' && (
                    <form onSubmit={handleSubmitSurvey} className="space-y-8">
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-indigo-700 dark:text-indigo-300 mb-6">Emotional Self-Assessment</h2>
                        {scenarios.map(scenario => (
                            <div key={scenario.id} className="bg-gray-50 dark:bg-gray-700 p-4 sm:p-6 rounded-lg shadow-inner border border-gray-200 dark:border-gray-600">
                                <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-indigo-600 dark:text-indigo-300 mb-3 sm:mb-4">
                                    {scenario.id}. {scenario.question}
                                </h2>
                                <div className="space-y-2 sm:space-y-3">
                                    {Object.entries(scenario.options).map(([optionKey, optionText]) => (
                                        <label key={optionKey} className="flex items-center p-2 sm:p-3 border border-gray-300 dark:border-gray-500 rounded-md cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900 transition duration-150 ease-in-out">
                                            <input
                                                type="radio"
                                                name={`scenario-${scenario.id}`}
                                                value={optionKey}
                                                checked={currentAnswers[scenario.id] === optionKey}
                                                onChange={() => handleAnswerChange(scenario.id, optionKey)}
                                                className="form-radio h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 focus:ring-indigo-500 dark:text-indigo-400 dark:focus:ring-indigo-400"
                                                required
                                            />
                                            <span className="ml-2 sm:ml-3 text-gray-700 dark:text-gray-200 text-sm sm:text-base">{optionText}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {/* Submission and Reset Buttons */}
                        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 mt-8">
                            <button
                                type="submit"
                                disabled={isLoading || !isLoggedIn}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 sm:py-3 sm:px-8 rounded-lg shadow-lg transform transition duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                            >
                                {isLoading ? (
                                    <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 inline-block" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : 'Submit Survey'}
                            </button>
                            <button
                                type="button"
                                onClick={resetSurvey}
                                disabled={isLoading}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2.5 px-6 sm:py-3 sm:px-8 rounded-lg shadow-lg transform transition duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                            >
                                Reset Survey
                            </button>
                        </div>

                        {/* Analysis Result Display (Moved here for survey page) */}
                        {showAnalysis && analysisResult && (
                            <div className="mt-10 bg-indigo-50 dark:bg-indigo-900 p-4 sm:p-6 rounded-lg shadow-md border-t-4 border-indigo-500 dark:border-indigo-700 transition-colors duration-200">
                                <h3 className="text-xl sm:text-2xl font-bold text-indigo-800 dark:text-indigo-300 mb-4">Your Emotional Insight:</h3>
                                <p className="text-sm sm:text-lg text-gray-700 dark:text-gray-200 leading-relaxed" dangerouslySetInnerHTML={{ __html: analysisResult.assessment }}></p>
                                
                                <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4 mt-6">
                                    {/* Generate Personalized Exercises Button */}
                                    <button
                                        type="button"
                                        onClick={handleGenerateExercises}
                                        disabled={isExerciseLoading || !analysisResult || analysisResult.identifiedProblems.length === 0}
                                        className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 sm:py-2.5 sm:px-6 rounded-lg shadow-md transform transition duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                                    >
                                        {isExerciseLoading ? (
                                            <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 inline-block" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        ) : 'Generate Personalized Exercises'}
                                    </button>

                                    {/* Get Additional Help Button */}
                                    <button
                                        type="button"
                                        onClick={handleGenerateAdditionalHelp}
                                        disabled={isHelpLoading || !analysisResult || analysisResult.identifiedProblems.length === 0}
                                        className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-4 sm:py-2.5 sm:px-6 rounded-lg shadow-md transform transition duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                                    >
                                        {isHelpLoading ? (
                                            <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 inline-block" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        ) : 'Get Additional Help'}
                                    </button>
                                </div>
                                
                                {/* Generated AI Content Display */}
                                {(generatedExercisePlan || additionalHelp || recommendedVideos.length > 0) && (
                                    <div className="mt-6 bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow-inner">
                                        {generatedExercisePlan && (
                                            <>
                                                <h4 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Generated Exercise Plan:</h4>
                                                <p className="text-sm sm:text-base text-gray-700 dark:text-gray-200">{generatedExercisePlan}</p>
                                            </>
                                        )}
                                        {additionalHelp && (
                                            <div className="mt-6 space-y-6">
                                                <div>
                                                    <h4 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Uplifting Poem</h4>
                                                    <div className="text-sm sm:text-base text-gray-700 dark:text-gray-200 italic whitespace-pre-line">
                                                        {additionalHelp.poem}
                                                    </div>
                                                </div>
                                                
                                                <div>
                                                    <h4 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Words of Encouragement</h4>
                                                    <p className="text-sm sm:text-base text-gray-700 dark:text-gray-200">
                                                        {additionalHelp.motivation}
                                                    </p>
                                                </div>
                                                
                                                <div>
                                                    <h4 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Recommended Podcasts</h4>
                                                    <ul className="list-disc pl-6 space-y-2">
                                                        {additionalHelp.podcasts.split('\n').map((podcast, index) => (
                                                            <li key={index} className="text-sm sm:text-base text-gray-700 dark:text-gray-200">
                                                                {podcast}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        )}
                                        {recommendedVideos.length > 0 && (
                                            <div className="mt-6">
                                                <h4 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Recommended Videos</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {recommendedVideos.map((video, index) => (
                                                        <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                                                            <video 
                                                                className="w-full h-48 object-cover"
                                                                controls
                                                                src={`/videos/${video}`}
                                                            >
                                                                Your browser does not support the video tag.
                                                            </video>
                                                            <div className="p-4">
                                                                <h5 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">
                                                                    {video.replace('.mp4', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                                </h5>
                                                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                                                    {videoDescriptions[video]}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </form>
                )}

                {currentPage === 'progress' && (
                    <div className="space-y-8">
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-indigo-700 dark:text-indigo-300 mb-6">Your Emotional Progress</h2>

                        {/* Emotional Scores from Latest Survey */}
                        {emotionalScoreData.length > 0 && (
                            <div className="bg-gray-50 dark:bg-gray-700 p-4 sm:p-6 rounded-lg shadow-inner border border-gray-200 dark:border-gray-600">
                                <h3 className="text-lg sm:text-xl font-semibold text-indigo-600 dark:text-indigo-300 mb-4">Emotional Scores (Latest Survey)</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={emotionalScoreData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#4B5563' : '#E5E7EB'}/>
                                        <XAxis dataKey="name" stroke={isDarkMode ? '#E5E7EB' : '#4B5563'} tick={{ fill: isDarkMode ? '#E5E7EB' : '#4B5563' }} />
                                        <YAxis stroke={isDarkMode ? '#E5E7EB' : '#4B5563'} tick={{ fill: isDarkMode ? '#E5E7EB' : '#4B5563' }} />
                                        <Tooltip cursor={{ fill: 'rgba(100, 100, 100, 0.2)' }} contentStyle={{ backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF', border: 'none' }} itemStyle={{ color: isDarkMode ? '#E5E7EB' : '#4B5563' }} />
                                        <Legend />
                                        <Bar dataKey="score" fill="#8884d8" name="Score" />
                                    </BarChart>
                                </ResponsiveContainer>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">Higher scores indicate a stronger presence of that emotion in your responses.</p>
                            </div>
                        )}

                        {/* Daily Mood Trend */}
                        {moodTrendData.length > 0 ? (
                            <div className="bg-gray-50 dark:bg-gray-700 p-4 sm:p-6 rounded-lg shadow-inner border border-gray-200 dark:border-gray-600">
                                <h3 className="text-lg sm:text-xl font-semibold text-indigo-600 dark:text-indigo-300 mb-4">Daily Mood Trend</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={moodTrendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#4B5563' : '#E5E7EB'} />
                                        <XAxis dataKey="date" stroke={isDarkMode ? '#E5E7EB' : '#4B5563'} tick={{ fill: isDarkMode ? '#E5E7EB' : '#4B5563' }} />
                                        <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} stroke={isDarkMode ? '#E5E7EB' : '#4B5563'} tick={{ fill: isDarkMode ? '#E5E7EB' : '#4B5563' }} />
                                        <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF', border: 'none' }} itemStyle={{ color: isDarkMode ? '#E5E7EB' : '#4B5563' }} />
                                        <Legend />
                                        <Line type="monotone" dataKey="mood" stroke="#82ca9d" name="Mood (1=Very Bad, 5=Very Good)" activeDot={{ r: 8 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">Track your mood over time (1: Very Bad, 5: Very Good).</p>
                            </div>
                        ) : (
                            <p className="text-gray-600 dark:text-gray-300 text-center">No daily mood check-ins recorded yet. Go to the "Daily Check-in" tab to start tracking!</p>
                        )}
                        
                        {userPastResults.length === 0 && emotionalScoreData.length === 0 && (
                            <p className="text-gray-600 dark:text-gray-300 text-center">No survey results or daily check-ins to display yet. Complete the survey and daily check-ins to see your progress here!</p>
                        )}
                    </div>
                )}

                {currentPage === 'checkin' && (
                    <div className="space-y-6">
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-indigo-700 dark:text-indigo-300 mb-6">Daily Mood Check-in</h2>
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 sm:p-6 rounded-lg shadow-inner border border-gray-200 dark:border-gray-600">
                            <p className="text-base sm:text-lg text-gray-700 dark:text-gray-200 mb-4">How are you feeling today?</p>
                            <div className="flex justify-center space-x-2 sm:space-x-4 mb-6">
                                {[1, 2, 3, 4, 5].map(value => (
                                    <label key={value} className="flex flex-col items-center cursor-pointer">
                                        <input
                                            type="radio"
                                            name="dailyMood"
                                            value={value}
                                            checked={dailyMood === value}
                                            onChange={() => setDailyMood(value)}
                                            className="form-radio h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 focus:ring-indigo-500 dark:text-indigo-400 dark:focus:ring-indigo-400"
                                        />
                                        <span className="mt-1 sm:mt-2 text-gray-700 dark:text-gray-200 text-xs sm:text-sm">
                                            {value === 1 ? 'Very Bad' :
                                             value === 2 ? 'Bad' :
                                             value === 3 ? 'Neutral' :
                                             value === 4 ? 'Good' :
                                             'Very Good'}
                                        </span>
                                    </label>
                                ))}
                            </div>
                            <button
                                onClick={handleDailyCheckIn}
                                disabled={isLoading || !isLoggedIn}
                                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-6 sm:py-3 sm:px-8 rounded-lg shadow-lg transform transition duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 flex items-center justify-center w-full disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                            >
                                {isLoading ? (
                                    <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 inline-block" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : 'Check In Mood'}
                            </button>
                        </div>

                        {dailyCheckIns.length > 0 && (
                            <div className="mt-8">
                                <h3 className="text-lg sm:text-xl font-semibold text-indigo-600 dark:text-indigo-300 mb-4">Your Recent Moods:</h3>
                                <ul className="space-y-2 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-inner border border-gray-200 dark:border-gray-600">
                                    {dailyCheckIns.filter(d => d.type === 'dailyCheckIn').slice(0, 5).map((checkIn, index) => ( // Show last 5
                                        <li key={index} className="flex justify-between items-center text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-600 pb-2 last:border-b-0 last:pb-0 text-sm sm:text-base">
                                            <span>{new Date(checkIn.timestamp).toLocaleDateString()}</span>
                                            <span className={`font-semibold ${
                                                checkIn.mood === 5 ? 'text-green-500' :
                                                checkIn.mood === 4 ? 'text-lime-500' :
                                                checkIn.mood === 3 ? 'text-yellow-500' :
                                                checkIn.mood === 2 ? 'text-orange-500' :
                                                'text-red-500'
                                            }`}>
                                                Mood: {checkIn.mood}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">See full trend in "View Progress" section.</p>
                            </div>
                        )}
                    </div>
                )}

                {currentPage === 'chatbot' && (
                    <div className="space-y-6">
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-indigo-700 dark:text-indigo-300 mb-6">Chat with AI Assistant</h2>
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 sm:p-6 rounded-lg shadow-inner border border-gray-200 dark:border-gray-600 h-80 sm:h-96 overflow-y-auto flex flex-col space-y-3 sm:space-y-4">
                            {chatHistory.length === 0 ? (
                                <p className="text-center text-gray-500 dark:text-gray-400 text-sm sm:text-base">Type a message to start chatting with the AI!</p>
                            ) : (
                                chatHistory.map((msg, index) => (
                                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`p-2 sm:p-3 rounded-lg max-w-[80%] text-sm sm:text-base ${
                                            msg.role === 'user'
                                                ? 'bg-blue-500 text-white rounded-br-none'
                                                : 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-100 rounded-bl-none'
                                        }`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                ))
                            )}
                            {isAiLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 p-2 sm:p-3 rounded-lg rounded-bl-none">
                                        <svg className="animate-pulse h-4 w-8 sm:h-5 sm:w-10 text-gray-500" viewBox="0 0 24 24" fill="currentColor">
                                            <circle cx="4" cy="12" r="3" />
                                            <circle cx="12" cy="12" r="3" />
                                            <circle cx="20" cy="12" r="3" />
                                        </svg>
                                    </div>
                                </div>
                            )}
                        </div>
                        <form onSubmit={handleChatSubmit} className="flex mt-4 space-x-2">
                            <input
                                type="text"
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                placeholder="Type your message..."
                                className="flex-grow p-2 sm:p-3 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
                                disabled={isAiLoading || !isLoggedIn}
                            />
                            <button
                                type="submit"
                                disabled={isAiLoading || !isLoggedIn || !chatInput.trim()}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 sm:py-3 sm:px-6 rounded-lg shadow-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                            >
                                Send
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default App;
