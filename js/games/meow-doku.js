// Game: Meowdoku - Cat Sudoku & Queens Logic Puzzle (مياو دوكو - سودوكو القطط)
// Exact visual replica of original Meowdoku: Rounded pastel tiles, Tuxedo Cats, Golden Fish lives,
// Single Click for X, Double Click for Cat!
(function() {
    window.initMeowDokuGame = function(container) {
        const appContainer = document.querySelector('.app-container');
        if (appContainer) {
            appContainer.classList.add('wide-mode');
        }

        // 24 Verified Levels Data with Unique Solutions
        const LEVELS_DATA = [
  {
    "id": 1,
    "size": 5,
    "difficulty": "medium",
    "title": "البداية اللطيفة",
    "grid": [
      [
        2,
        0,
        0,
        1,
        1
      ],
      [
        2,
        4,
        4,
        1,
        1
      ],
      [
        2,
        4,
        4,
        4,
        3
      ],
      [
        2,
        2,
        4,
        4,
        3
      ],
      [
        2,
        2,
        4,
        4,
        4
      ]
    ],
    "solution": [
      1,
      3,
      0,
      4,
      2
    ]
  },
  {
    "id": 2,
    "size": 5,
    "difficulty": "medium",
    "title": "حديقة الفراشات",
    "grid": [
      [
        1,
        1,
        1,
        0,
        0
      ],
      [
        1,
        1,
        2,
        0,
        0
      ],
      [
        1,
        1,
        2,
        2,
        2
      ],
      [
        1,
        1,
        2,
        2,
        3
      ],
      [
        4,
        4,
        2,
        2,
        2
      ]
    ],
    "solution": [
      3,
      0,
      2,
      4,
      1
    ]
  },
  {
    "id": 3,
    "size": 5,
    "difficulty": "medium",
    "title": "ممر السمكات",
    "grid": [
      [
        0,
        0,
        0,
        0,
        0
      ],
      [
        0,
        1,
        1,
        2,
        2
      ],
      [
        0,
        3,
        3,
        2,
        2
      ],
      [
        3,
        3,
        3,
        4,
        4
      ],
      [
        3,
        3,
        3,
        4,
        4
      ]
    ],
    "solution": [
      0,
      2,
      4,
      1,
      3
    ]
  },
  {
    "id": 4,
    "size": 6,
    "difficulty": "medium",
    "title": "مربعات الصوف",
    "grid": [
      [
        0,
        0,
        0,
        0,
        0,
        0
      ],
      [
        0,
        1,
        0,
        3,
        3,
        2
      ],
      [
        0,
        5,
        0,
        3,
        3,
        2
      ],
      [
        5,
        5,
        3,
        3,
        3,
        2
      ],
      [
        5,
        5,
        3,
        4,
        4,
        2
      ],
      [
        5,
        5,
        5,
        2,
        2,
        2
      ]
    ],
    "solution": [
      3,
      1,
      5,
      2,
      4,
      0
    ]
  },
  {
    "id": 5,
    "size": 6,
    "difficulty": "medium",
    "title": "سلم المياو",
    "grid": [
      [
        0,
        2,
        1,
        1,
        1,
        1
      ],
      [
        2,
        2,
        2,
        1,
        1,
        3
      ],
      [
        2,
        2,
        2,
        1,
        1,
        3
      ],
      [
        4,
        2,
        2,
        4,
        4,
        3
      ],
      [
        4,
        4,
        4,
        4,
        4,
        3
      ],
      [
        4,
        4,
        4,
        4,
        5,
        5
      ]
    ],
    "solution": [
      0,
      3,
      1,
      5,
      2,
      4
    ]
  },
  {
    "id": 6,
    "size": 6,
    "difficulty": "medium",
    "title": "متاهة الخيوط",
    "grid": [
      [
        1,
        1,
        1,
        0,
        0,
        0
      ],
      [
        1,
        1,
        1,
        0,
        2,
        0
      ],
      [
        1,
        1,
        2,
        2,
        2,
        0
      ],
      [
        1,
        1,
        3,
        3,
        2,
        0
      ],
      [
        4,
        1,
        1,
        5,
        5,
        0
      ],
      [
        4,
        4,
        5,
        5,
        5,
        0
      ]
    ],
    "solution": [
      5,
      1,
      4,
      2,
      0,
      3
    ]
  },
  {
    "id": 7,
    "size": 7,
    "difficulty": "hard",
    "title": "مملكة السيامي",
    "grid": [
      [
        1,
        1,
        1,
        0,
        0,
        0,
        0
      ],
      [
        1,
        1,
        0,
        0,
        0,
        0,
        0
      ],
      [
        1,
        1,
        1,
        0,
        2,
        3,
        3
      ],
      [
        1,
        4,
        4,
        4,
        3,
        3,
        3
      ],
      [
        4,
        4,
        4,
        4,
        4,
        3,
        3
      ],
      [
        5,
        6,
        4,
        4,
        4,
        3,
        3
      ],
      [
        5,
        6,
        6,
        4,
        4,
        3,
        3
      ]
    ],
    "solution": [
      5,
      1,
      4,
      6,
      3,
      0,
      2
    ]
  },
  {
    "id": 8,
    "size": 7,
    "difficulty": "hard",
    "title": "برج الشيرازي",
    "grid": [
      [
        0,
        0,
        1,
        1,
        2,
        2,
        2
      ],
      [
        3,
        1,
        1,
        2,
        2,
        2,
        2
      ],
      [
        3,
        1,
        3,
        2,
        2,
        2,
        2
      ],
      [
        3,
        3,
        3,
        2,
        2,
        2,
        2
      ],
      [
        6,
        3,
        3,
        4,
        4,
        4,
        5
      ],
      [
        6,
        6,
        6,
        5,
        5,
        5,
        5
      ],
      [
        6,
        6,
        6,
        6,
        5,
        5,
        5
      ]
    ],
    "solution": [
      0,
      2,
      5,
      1,
      4,
      6,
      3
    ]
  },
  {
    "id": 9,
    "size": 7,
    "difficulty": "hard",
    "title": "لغز المخلب الذكي",
    "grid": [
      [
        1,
        0,
        0,
        0,
        0,
        0,
        0
      ],
      [
        1,
        1,
        1,
        0,
        0,
        0,
        0
      ],
      [
        2,
        1,
        1,
        0,
        0,
        3,
        3
      ],
      [
        4,
        1,
        1,
        1,
        0,
        3,
        3
      ],
      [
        4,
        4,
        4,
        1,
        1,
        3,
        3
      ],
      [
        4,
        6,
        6,
        6,
        6,
        5,
        3
      ],
      [
        4,
        6,
        6,
        6,
        6,
        6,
        3
      ]
    ],
    "solution": [
      4,
      2,
      0,
      6,
      1,
      5,
      3
    ]
  },
  {
    "id": 10,
    "size": 7,
    "difficulty": "hard",
    "title": "غابة النعناع البري",
    "grid": [
      [
        1,
        1,
        1,
        1,
        0,
        0,
        3
      ],
      [
        1,
        1,
        1,
        0,
        0,
        0,
        3
      ],
      [
        1,
        1,
        1,
        1,
        2,
        3,
        3
      ],
      [
        1,
        2,
        2,
        2,
        2,
        3,
        3
      ],
      [
        2,
        2,
        2,
        4,
        2,
        2,
        3
      ],
      [
        5,
        2,
        2,
        4,
        4,
        4,
        3
      ],
      [
        6,
        6,
        6,
        4,
        4,
        4,
        3
      ]
    ],
    "solution": [
      5,
      1,
      4,
      6,
      3,
      0,
      2
    ]
  },
  {
    "id": 11,
    "size": 8,
    "difficulty": "hard",
    "title": "عرين الماكرين",
    "grid": [
      [
        2,
        2,
        0,
        0,
        2,
        1,
        1,
        1
      ],
      [
        2,
        2,
        2,
        2,
        2,
        2,
        1,
        1
      ],
      [
        2,
        2,
        2,
        2,
        2,
        2,
        1,
        1
      ],
      [
        4,
        4,
        4,
        2,
        2,
        2,
        1,
        3
      ],
      [
        4,
        4,
        4,
        2,
        2,
        2,
        5,
        5
      ],
      [
        4,
        5,
        5,
        5,
        5,
        5,
        5,
        5
      ],
      [
        7,
        6,
        6,
        5,
        5,
        5,
        5,
        5
      ],
      [
        7,
        7,
        5,
        5,
        5,
        5,
        5,
        5
      ]
    ],
    "solution": [
      3,
      6,
      4,
      7,
      1,
      5,
      2,
      0
    ]
  },
  {
    "id": 12,
    "size": 8,
    "difficulty": "hard",
    "title": "خطوط التنافر",
    "grid": [
      [
        2,
        2,
        1,
        1,
        1,
        1,
        0,
        0
      ],
      [
        2,
        2,
        2,
        2,
        1,
        1,
        1,
        3
      ],
      [
        2,
        2,
        2,
        2,
        3,
        3,
        3,
        3
      ],
      [
        4,
        2,
        2,
        2,
        6,
        6,
        3,
        3
      ],
      [
        4,
        4,
        4,
        2,
        6,
        6,
        6,
        3
      ],
      [
        5,
        4,
        4,
        6,
        6,
        6,
        6,
        6
      ],
      [
        7,
        7,
        7,
        6,
        6,
        6,
        6,
        6
      ],
      [
        7,
        7,
        7,
        6,
        6,
        6,
        6,
        6
      ]
    ],
    "solution": [
      7,
      5,
      3,
      6,
      2,
      0,
      4,
      1
    ]
  },
  {
    "id": 13,
    "size": 8,
    "difficulty": "hard",
    "title": "حصن الكاليكو",
    "grid": [
      [
        2,
        2,
        2,
        2,
        0,
        0,
        0,
        0
      ],
      [
        1,
        2,
        2,
        2,
        2,
        0,
        0,
        0
      ],
      [
        2,
        2,
        2,
        2,
        3,
        5,
        5,
        5
      ],
      [
        2,
        4,
        2,
        5,
        3,
        5,
        5,
        5
      ],
      [
        4,
        4,
        2,
        5,
        5,
        5,
        5,
        5
      ],
      [
        4,
        4,
        5,
        5,
        5,
        5,
        5,
        5
      ],
      [
        4,
        5,
        5,
        5,
        5,
        5,
        6,
        6
      ],
      [
        4,
        5,
        5,
        5,
        7,
        7,
        7,
        6
      ]
    ],
    "solution": [
      6,
      0,
      2,
      4,
      1,
      3,
      7,
      5
    ]
  },
  {
    "id": 14,
    "size": 8,
    "difficulty": "hard",
    "title": "أحجية الجيران",
    "grid": [
      [
        3,
        3,
        3,
        3,
        0,
        0,
        1,
        1
      ],
      [
        3,
        3,
        3,
        3,
        2,
        1,
        1,
        1
      ],
      [
        3,
        3,
        3,
        3,
        2,
        1,
        1,
        1
      ],
      [
        3,
        3,
        3,
        3,
        3,
        4,
        4,
        4
      ],
      [
        3,
        5,
        6,
        6,
        6,
        6,
        4,
        4
      ],
      [
        7,
        5,
        6,
        6,
        6,
        4,
        4,
        4
      ],
      [
        7,
        6,
        6,
        6,
        6,
        6,
        4,
        6
      ],
      [
        7,
        6,
        6,
        6,
        6,
        6,
        6,
        6
      ]
    ],
    "solution": [
      5,
      7,
      4,
      2,
      6,
      1,
      3,
      0
    ]
  },
  {
    "id": 15,
    "size": 8,
    "difficulty": "expert",
    "title": "دهاء الهررة الكبار",
    "grid": [
      [
        3,
        3,
        3,
        3,
        3,
        0,
        0,
        0
      ],
      [
        2,
        3,
        4,
        3,
        3,
        1,
        0,
        0
      ],
      [
        2,
        4,
        4,
        3,
        3,
        3,
        0,
        0
      ],
      [
        4,
        4,
        4,
        3,
        3,
        3,
        3,
        5
      ],
      [
        4,
        4,
        4,
        3,
        3,
        5,
        5,
        5
      ],
      [
        6,
        6,
        6,
        6,
        3,
        5,
        5,
        5
      ],
      [
        6,
        6,
        6,
        6,
        3,
        7,
        7,
        7
      ],
      [
        6,
        6,
        6,
        6,
        7,
        7,
        7,
        7
      ]
    ],
    "solution": [
      7,
      5,
      0,
      3,
      1,
      6,
      2,
      4
    ]
  },
  {
    "id": 16,
    "size": 8,
    "difficulty": "expert",
    "title": "خريطة البسيسة الملكية",
    "grid": [
      [
        0,
        0,
        1,
        1,
        1,
        1,
        1,
        1
      ],
      [
        1,
        1,
        1,
        2,
        1,
        1,
        1,
        1
      ],
      [
        1,
        3,
        1,
        2,
        2,
        2,
        1,
        1
      ],
      [
        1,
        3,
        1,
        2,
        2,
        2,
        2,
        2
      ],
      [
        3,
        3,
        6,
        6,
        6,
        5,
        4,
        4
      ],
      [
        3,
        3,
        3,
        6,
        6,
        5,
        7,
        7
      ],
      [
        3,
        3,
        3,
        6,
        6,
        6,
        7,
        7
      ],
      [
        3,
        3,
        6,
        6,
        6,
        6,
        7,
        7
      ]
    ],
    "solution": [
      0,
      2,
      4,
      1,
      7,
      5,
      3,
      6
    ]
  },
  {
    "id": 17,
    "size": 9,
    "difficulty": "expert",
    "title": "عرش ملك القطط",
    "grid": [
      [
        5,
        5,
        5,
        5,
        1,
        0,
        0,
        0,
        0
      ],
      [
        5,
        5,
        5,
        5,
        1,
        0,
        0,
        0,
        0
      ],
      [
        5,
        5,
        5,
        5,
        1,
        0,
        0,
        2,
        0
      ],
      [
        5,
        5,
        3,
        5,
        4,
        6,
        6,
        6,
        6
      ],
      [
        5,
        5,
        5,
        5,
        4,
        4,
        6,
        6,
        6
      ],
      [
        5,
        5,
        5,
        5,
        8,
        6,
        6,
        6,
        8
      ],
      [
        7,
        5,
        5,
        5,
        8,
        6,
        6,
        6,
        8
      ],
      [
        7,
        5,
        5,
        8,
        8,
        8,
        8,
        8,
        8
      ],
      [
        5,
        5,
        5,
        8,
        8,
        8,
        8,
        8,
        8
      ]
    ],
    "solution": [
      8,
      4,
      7,
      2,
      5,
      1,
      6,
      0,
      3
    ]
  },
  {
    "id": 18,
    "size": 9,
    "difficulty": "expert",
    "title": "متاهة الديجيتال",
    "grid": [
      [
        0,
        1,
        1,
        1,
        1,
        2,
        2,
        2,
        2
      ],
      [
        1,
        1,
        1,
        3,
        3,
        2,
        2,
        2,
        2
      ],
      [
        5,
        3,
        3,
        3,
        3,
        2,
        2,
        2,
        2
      ],
      [
        5,
        5,
        3,
        3,
        3,
        3,
        4,
        2,
        2
      ],
      [
        5,
        5,
        3,
        3,
        3,
        4,
        4,
        2,
        7
      ],
      [
        5,
        5,
        5,
        5,
        3,
        7,
        7,
        7,
        7
      ],
      [
        5,
        5,
        5,
        5,
        5,
        7,
        7,
        7,
        6
      ],
      [
        5,
        5,
        5,
        5,
        5,
        7,
        7,
        7,
        7
      ],
      [
        5,
        5,
        5,
        5,
        8,
        8,
        7,
        7,
        7
      ]
    ],
    "solution": [
      0,
      2,
      7,
      3,
      5,
      1,
      8,
      6,
      4
    ]
  },
  {
    "id": 19,
    "size": 9,
    "difficulty": "expert",
    "title": "حسابات النمر الصغير",
    "grid": [
      [
        0,
        0,
        0,
        0,
        2,
        2,
        2,
        3,
        1
      ],
      [
        4,
        0,
        2,
        2,
        2,
        2,
        2,
        3,
        1
      ],
      [
        4,
        4,
        5,
        2,
        2,
        2,
        2,
        3,
        1
      ],
      [
        4,
        5,
        5,
        5,
        5,
        2,
        2,
        3,
        3
      ],
      [
        4,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        3
      ],
      [
        7,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5
      ],
      [
        7,
        7,
        7,
        6,
        5,
        5,
        5,
        5,
        5
      ],
      [
        7,
        7,
        7,
        7,
        7,
        5,
        5,
        5,
        5
      ],
      [
        7,
        7,
        7,
        7,
        7,
        5,
        8,
        8,
        8
      ]
    ],
    "solution": [
      2,
      8,
      4,
      7,
      0,
      5,
      3,
      1,
      6
    ]
  },
  {
    "id": 20,
    "size": 9,
    "difficulty": "expert",
    "title": "تحدي الأستاذ مياو",
    "grid": [
      [
        0,
        1,
        1,
        2,
        2,
        2,
        5,
        5,
        5
      ],
      [
        1,
        1,
        1,
        2,
        2,
        2,
        6,
        5,
        5
      ],
      [
        3,
        3,
        1,
        2,
        2,
        6,
        6,
        6,
        5
      ],
      [
        3,
        3,
        3,
        6,
        6,
        6,
        6,
        6,
        5
      ],
      [
        3,
        3,
        4,
        4,
        4,
        6,
        6,
        6,
        5
      ],
      [
        3,
        4,
        4,
        6,
        6,
        6,
        6,
        5,
        5
      ],
      [
        3,
        4,
        4,
        6,
        6,
        6,
        6,
        5,
        7
      ],
      [
        6,
        6,
        6,
        6,
        6,
        6,
        7,
        7,
        7
      ],
      [
        6,
        6,
        6,
        6,
        6,
        8,
        8,
        8,
        8
      ]
    ],
    "solution": [
      0,
      2,
      4,
      1,
      3,
      7,
      5,
      8,
      6
    ]
  },
  {
    "id": 21,
    "size": 9,
    "difficulty": "expert",
    "title": "أطلال الصناديق",
    "grid": [
      [
        0,
        0,
        2,
        2,
        3,
        3,
        3,
        3,
        3
      ],
      [
        1,
        1,
        1,
        2,
        3,
        3,
        3,
        3,
        3
      ],
      [
        2,
        2,
        2,
        2,
        2,
        3,
        3,
        3,
        3
      ],
      [
        2,
        4,
        4,
        4,
        2,
        3,
        3,
        3,
        3
      ],
      [
        4,
        4,
        4,
        4,
        3,
        3,
        3,
        3,
        3
      ],
      [
        4,
        4,
        4,
        4,
        5,
        5,
        5,
        5,
        5
      ],
      [
        7,
        7,
        4,
        4,
        5,
        5,
        5,
        5,
        6
      ],
      [
        7,
        7,
        4,
        5,
        5,
        5,
        5,
        8,
        6
      ],
      [
        7,
        7,
        5,
        5,
        5,
        5,
        5,
        8,
        8
      ]
    ],
    "solution": [
      0,
      2,
      4,
      6,
      3,
      5,
      8,
      1,
      7
    ]
  },
  {
    "id": 22,
    "size": 9,
    "difficulty": "expert",
    "title": "عاصفة المخالب",
    "grid": [
      [
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        1,
        0
      ],
      [
        5,
        5,
        5,
        5,
        5,
        5,
        1,
        1,
        0
      ],
      [
        2,
        5,
        5,
        5,
        5,
        4,
        1,
        1,
        1
      ],
      [
        2,
        5,
        5,
        5,
        4,
        4,
        3,
        3,
        3
      ],
      [
        5,
        5,
        5,
        5,
        4,
        6,
        6,
        6,
        6
      ],
      [
        5,
        5,
        5,
        5,
        6,
        6,
        6,
        6,
        6
      ],
      [
        5,
        5,
        5,
        5,
        6,
        6,
        6,
        6,
        6
      ],
      [
        8,
        7,
        8,
        8,
        8,
        6,
        6,
        6,
        6
      ],
      [
        8,
        8,
        8,
        8,
        8,
        6,
        6,
        6,
        6
      ]
    ],
    "solution": [
      8,
      6,
      0,
      7,
      4,
      2,
      5,
      1,
      3
    ]
  },
  {
    "id": 23,
    "size": 9,
    "difficulty": "expert",
    "title": "القلعة المحصنة",
    "grid": [
      [
        0,
        1,
        1,
        1,
        2,
        2,
        2,
        2,
        2
      ],
      [
        1,
        1,
        1,
        1,
        2,
        2,
        2,
        2,
        2
      ],
      [
        4,
        4,
        4,
        4,
        2,
        2,
        2,
        2,
        2
      ],
      [
        4,
        4,
        4,
        2,
        2,
        2,
        2,
        2,
        3
      ],
      [
        5,
        4,
        4,
        4,
        2,
        2,
        2,
        2,
        6
      ],
      [
        5,
        5,
        4,
        4,
        4,
        7,
        8,
        6,
        6
      ],
      [
        5,
        4,
        4,
        4,
        7,
        7,
        8,
        6,
        8
      ],
      [
        4,
        4,
        4,
        4,
        7,
        7,
        8,
        8,
        8
      ],
      [
        4,
        4,
        4,
        7,
        7,
        7,
        8,
        8,
        8
      ]
    ],
    "solution": [
      0,
      2,
      5,
      8,
      3,
      1,
      7,
      4,
      6
    ]
  },
  {
    "id": 24,
    "size": 9,
    "difficulty": "expert",
    "title": "أسطورة المياودوكو",
    "grid": [
      [
        0,
        1,
        1,
        2,
        2,
        2,
        2,
        2,
        4
      ],
      [
        1,
        1,
        1,
        2,
        2,
        2,
        2,
        4,
        4
      ],
      [
        1,
        1,
        1,
        2,
        2,
        4,
        4,
        4,
        4
      ],
      [
        3,
        3,
        3,
        2,
        4,
        4,
        4,
        4,
        6
      ],
      [
        3,
        7,
        7,
        5,
        5,
        4,
        4,
        6,
        6
      ],
      [
        3,
        7,
        7,
        5,
        5,
        5,
        4,
        6,
        6
      ],
      [
        7,
        7,
        7,
        7,
        7,
        7,
        6,
        6,
        6
      ],
      [
        7,
        7,
        7,
        7,
        7,
        7,
        6,
        6,
        8
      ],
      [
        7,
        7,
        7,
        7,
        7,
        7,
        6,
        6,
        8
      ]
    ],
    "solution": [
      0,
      2,
      4,
      1,
      6,
      3,
      7,
      5,
      8
    ]
  }
];

        // Exact Meowdoku Palette from the official game
        const REGION_COLORS = [
            '#2BA59D', // Teal / Aqua
            '#D16A6E', // Coral Red
            '#E9BC3F', // Golden Yellow
            '#8570C2', // Lavender Purple
            '#F7A361', // Orange Peach
            '#E27AA4', // Pink
            '#A4D29F', // Light Green
            '#5DADE2', // Sky Blue
            '#A66B49', // Warm Brown
            '#4D648D', // Deep Slate Blue
            '#48C9B0', // Seafoam
            '#F1948A'  // Salmon
        ];

        // Cute Tuxedo Cat SVG
        const CAT_SVG = `<svg viewBox="0 0 100 100" style="width: 82%; height: 82%; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));">
    <path d="M 20 80 Q 20 40 30 20 L 42 38 Q 50 36 58 38 L 70 20 Q 80 40 80 80 Q 50 90 20 80 Z" fill="#2D3748" />
    <polygon points="26,30 31,23 37,34" fill="#F472B6" />
    <polygon points="74,30 69,23 63,34" fill="#F472B6" />
    <path d="M 50 42 Q 35 48 32 68 Q 30 84 50 86 Q 70 84 68 68 Q 65 48 50 42 Z" fill="#FFFFFF" />
    <ellipse cx="38" cy="55" rx="3.5" ry="4.5" fill="#1A202C" />
    <ellipse cx="62" cy="55" rx="3.5" ry="4.5" fill="#1A202C" />
    <circle cx="37" cy="53" r="1.5" fill="#FFFFFF" />
    <circle cx="61" cy="53" r="1.5" fill="#FFFFFF" />
    <polygon points="47,66 53,66 50,70" fill="#F472B6" />
    <path d="M 46 72 Q 50 75 54 72" stroke="#4A5568" stroke-width="2" fill="none" stroke-linecap="round" />
    <line x1="22" y1="64" x2="33" y2="66" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" />
    <line x1="21" y1="71" x2="33" y2="70" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" />
    <line x1="78" y1="64" x2="67" y2="66" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" />
    <line x1="79" y1="71" x2="67" y2="70" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" />
</svg>`;

        // State variables
        let currentLevelIndex = parseInt(localStorage.getItem('meowdoku_current_level') || '0');
        if (currentLevelIndex >= LEVELS_DATA.length) currentLevelIndex = 0;

        let board = []; // 2D array: 0: empty, 1: white cross, 2: cat 🐱, 3: red cross (mistake)
        let boardHistory = [];
        let isDragging = false;
        let dragMoved = false;
        let dragStartX = 0;
        let dragStartY = 0;
        let dragStartCell = null;
        let lastProcessedCell = null;
        let dragAction = 'cross'; // 'cross', 'erase', or 'none'
        let lastSoundTime = 0;

        let timerSeconds = 0;
        let timerInterval = null;
        let mistakes = 0;
        let score = parseInt(localStorage.getItem('meowdoku_score') || '150');
        const maxHearts = 3;
        let heartsLeft = 3;
        let gameActive = true;

        // Double-click & Single-click timing tracker
        let clickTimer = null;
        let lastClickedCell = null;
        let lastClickTime = 0;

        // Audio helper
        function playMeow() {
            try {
                if (window.sound) window.sound.resume();
                const ctx = (window.sound && window.sound.ctx) || new (window.AudioContext || window.webkitAudioContext)();
                if (!ctx) return;
                const now = ctx.currentTime;
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(440, now);
                osc.frequency.linearRampToValueAtTime(820, now + 0.12);
                osc.frequency.exponentialRampToValueAtTime(540, now + 0.32);
                gain.gain.setValueAtTime(0.01, now);
                gain.gain.linearRampToValueAtTime(0.28, now + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.34);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now);
                osc.stop(now + 0.35);
            } catch(e) {}
        }

        function playPurr() {
            try {
                if (window.sound) window.sound.resume();
                const ctx = (window.sound && window.sound.ctx) || new (window.AudioContext || window.webkitAudioContext)();
                if (!ctx) return;
                const now = ctx.currentTime;
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(160, now);
                osc.frequency.linearRampToValueAtTime(220, now + 0.15);
                gain.gain.setValueAtTime(0.12, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now);
                osc.stop(now + 0.21);
            } catch(e) {}
        }

        function playPurrThrottled() {
            const now = Date.now();
            if (now - lastSoundTime > 65) {
                lastSoundTime = now;
                playPurr();
            }
        }

        function playErrorSound() {
            if (window.sound) window.sound.playFail();
        }

        function playSuccessSound() {
            playMeow();
            setTimeout(() => {
                if (window.sound) window.sound.playSuccess();
            }, 120);
        }

        function formatTime(sec) {
            const m = Math.floor(sec / 60);
            const s = sec % 60;
            return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
        }

        // Layout HTML matching the exact screenshot
        const html = `
            <div class="meow-doku-container" style="display: flex; flex-direction: column; align-items: center; width: 100%; max-width: 480px; margin: 0 auto; user-select: none; font-family: var(--font-kids), 'Tajawal', sans-serif; direction: ltr; box-sizing: border-box; padding: 4px 10px; background: #FAF7F2; border-radius: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
                
                <!-- TOP HEADER: Stages, Level & Score, Settings -->
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; padding: 8px 4px 4px; box-sizing: border-box;">
                    <!-- Back / Stages Button -->
                    <button id="mdStagesBtn" title="قائمة المراحل" style="width: 38px; height: 38px; border-radius: 50%; background: #FFFFFF; border: 1.5px solid #EFEBE4; color: #6D4C41; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.06); transition: transform 0.1s;">
                        🗺️
                    </button>

                    <!-- Center: Level and Score -->
                    <div style="text-align: center;">
                        <div style="font-size: 11px; color: #8D6E63; font-weight: bold; letter-spacing: 0.5px;">Level / المستوى</div>
                        <div id="mdLevelNum" style="font-size: 24px; font-weight: 900; color: #5D4037; line-height: 1.1;">1</div>
                    </div>

                    <div style="text-align: center;">
                        <div style="font-size: 11px; color: #8D6E63; font-weight: bold; letter-spacing: 0.5px;">Score / النتيجة</div>
                        <div id="mdScoreNum" style="font-size: 24px; font-weight: 900; color: #5D4037; line-height: 1.1;">150</div>
                    </div>

                    <!-- Reset / Undo Button -->
                    <button id="mdResetBtn" title="إعادة المستوى" style="width: 38px; height: 38px; border-radius: 50%; background: #FFFFFF; border: 1.5px solid #EFEBE4; color: #6D4C41; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.06);">
                        🔄
                    </button>
                </div>

                <!-- PROGRESS BAR: Cat silhouettes + Golden Fish lives -->
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; padding: 4px 6px 8px; box-sizing: border-box;">
                    <!-- Cat Silhouettes for this level -->
                    <div id="mdCatTrack" style="display: flex; gap: 4px; align-items: center;">
                        <!-- Injected dynamically -->
                    </div>

                    <!-- 3 Golden Fish Crackers / Treats (Lives) -->
                    <div id="mdFishTreats" style="display: flex; gap: 3px; font-size: 20px; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.15));" title="الأسماك / الفرص المتبقية">
                        <span>🐟</span><span>🐟</span><span>🐟</span>
                    </div>
                </div>

                <!-- 3 RULE BANNER CARDS (Exact match to screenshot) -->
                <div style="display: flex; justify-content: center; gap: 6px; width: 100%; margin-bottom: 10px; box-sizing: border-box;">
                    <!-- Rule 1: 1 Cat per color -->
                    <div style="flex: 1; background: #FFFFFF; border-radius: 12px; padding: 6px 4px; display: flex; align-items: center; gap: 5px; box-shadow: 0 2px 6px rgba(0,0,0,0.03); border: 1px solid #EFEBE4;">
                        <div style="width: 24px; height: 24px; border-radius: 6px; background: #FFF3E0; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 900; color: #E65100; flex-shrink: 0;">🎨</div>
                        <div style="font-size: 9.5px; font-weight: bold; color: #5D4037; line-height: 1.2;">قطة لكل لون<br><span style="font-size: 7.5px; color: #8D6E63;">1 per color</span></div>
                    </div>
                    <!-- Rule 2: 1 Cat per col & row -->
                    <div style="flex: 1; background: #FFFFFF; border-radius: 12px; padding: 6px 4px; display: flex; align-items: center; gap: 5px; box-shadow: 0 2px 6px rgba(0,0,0,0.03); border: 1px solid #EFEBE4;">
                        <div style="width: 24px; height: 24px; border-radius: 6px; background: #E8F5E9; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 900; color: #2E7D32; flex-shrink: 0;">↔️</div>
                        <div style="font-size: 9.5px; font-weight: bold; color: #5D4037; line-height: 1.2;">قطة لكل صف وعمود<br><span style="font-size: 7.5px; color: #8D6E63;">Row & Col</span></div>
                    </div>
                    <!-- Rule 3: Cats cannot touch -->
                    <div style="flex: 1; background: #FFFFFF; border-radius: 12px; padding: 6px 4px; display: flex; align-items: center; gap: 5px; box-shadow: 0 2px 6px rgba(0,0,0,0.03); border: 1px solid #EFEBE4;">
                        <div style="width: 24px; height: 24px; border-radius: 6px; background: #FCE4EC; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 900; color: #C2185B; flex-shrink: 0;">🚫</div>
                        <div style="font-size: 9.5px; font-weight: bold; color: #5D4037; line-height: 1.2;">القطط لا تتلامس<br><span style="font-size: 7.5px; color: #8D6E63;">No touch</span></div>
                    </div>
                </div>

                <!-- MAIN PUZZLE BOARD CONTAINER (Exact rounded pastel tiles) -->
                <div id="mdBoardWrapper" style="position: relative; display: flex; justify-content: center; align-items: center; width: 100%; margin-bottom: 10px; direction: ltr;">
                    <div id="mdBoard" dir="ltr" style="display: grid; direction: ltr; background: #FFFFFF; border: 4.5px solid #EAE5DC; border-radius: 20px; padding: 6px; box-shadow: 0 8px 24px rgba(0,0,0,0.06); gap: 3.5px; touch-action: none; box-sizing: border-box;"></div>
                </div>

                <!-- CONTROLS & INSTRUCTIONS BANNER -->
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; max-width: 440px; padding: 4px 6px; margin-bottom: 6px;">
                    <div style="font-size: 11px; color: #795548; font-weight: bold; display: flex; align-items: center; gap: 4px;">
                        <span>👆 نقرة واحدة: <strong>✕</strong></span>
                        <span style="color: #BCAAA4;">|</span>
                        <span>✌️ دبل كليك: <strong>🐱</strong></span>
                    </div>

                    <div style="display: flex; align-items: center; gap: 6px;">
                        <button id="mdUndoBtn" title="تراجع" style="background: #FFFFFF; border: 1px solid #D7CCC8; width: 34px; height: 34px; border-radius: 10px; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.04);">
                            ↩️
                        </button>
                        <button id="mdHintBtn" title="تلميح" style="background: #FFF9C4; border: 1px solid #FBC02D; width: 34px; height: 34px; border-radius: 10px; font-size: 15px; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.04);">
                            💡
                        </button>
                    </div>
                </div>

                <!-- Status & Timer (Auto-cross completely removed per request) -->
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; max-width: 440px; padding: 0 6px 4px;">
                    <div style="font-size: 10.5px; color: #D32F2F; font-weight: bold; display: flex; align-items: center; gap: 3px;">
                        <span>⚠️ الخطأ يظهر ✕ أحمر ويخصم سمكة 🐟</span>
                    </div>

                    <div style="font-size: 11px; color: #8D6E63; font-weight: bold;">
                        ⏱️ <span id="mdTimer">00:00</span>
                    </div>
                </div>

                <!-- BOTTOM CUTE BANNER: Blue Cat silhouette 'Cute and Fun' (Exact match to screenshot) -->
                <div style="width: 100%; background: #B3E5FC; border-radius: 18px 18px 22px 22px; padding: 8px 12px; margin-top: 4px; text-align: center; position: relative; overflow: hidden; box-shadow: inset 0 2px 6px rgba(0,0,0,0.04);">
                    <div style="font-size: 16px; font-weight: 900; color: #0277BD; letter-spacing: 0.5px; text-shadow: 0 1px 0 rgba(255,255,255,0.7);">
                        🐱 Meowdoku • Cute and Fun 🐱
                    </div>
                </div>

                <!-- STAGES SELECTION MODAL -->
                <div id="mdStagesModal" style="display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.65); backdrop-filter: blur(6px); z-index: 100; align-items: center; justify-content: center; padding: 15px; box-sizing: border-box; border-radius: 20px;">
                    <div style="background: #FAF7F2; width: 100%; max-width: 420px; max-height: 90vh; border-radius: 24px; padding: 18px; box-shadow: 0 10px 30px rgba(0,0,0,0.25); display: flex; flex-direction: column; overflow: hidden; border: 3px solid #F7A361;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                            <h3 style="margin: 0; color: #5D4037; font-size: 17px; font-weight: 900;">
                                🗺️ مراحل مياو دوكو (24 مرحلة)
                            </h3>
                            <button id="mdCloseStagesBtn" style="background: #EFEBE4; border: none; width: 30px; height: 30px; border-radius: 50%; font-weight: 900; cursor: pointer; color: #5D4037;">✕</button>
                        </div>

                        <!-- Stages Tabs: All, Medium, Hard, Expert -->
                        <div style="display: flex; gap: 6px; margin-bottom: 12px;">
                            <button class="md-tab-btn active" data-tab="all" style="flex: 1; padding: 6px; border-radius: 10px; border: none; background: #F7A361; color: white; font-weight: bold; font-size: 11px; cursor: pointer;">الكل (24)</button>
                            <button class="md-tab-btn" data-tab="medium" style="flex: 1; padding: 6px; border-radius: 10px; border: none; background: #EFEBE4; color: #5D4037; font-weight: bold; font-size: 11px; cursor: pointer;">متوسط (5-6)</button>
                            <button class="md-tab-btn" data-tab="hard" style="flex: 1; padding: 6px; border-radius: 10px; border: none; background: #EFEBE4; color: #5D4037; font-weight: bold; font-size: 11px; cursor: pointer;">صعب (7-8)</button>
                            <button class="md-tab-btn" data-tab="expert" style="flex: 1; padding: 6px; border-radius: 10px; border: none; background: #EFEBE4; color: #5D4037; font-weight: bold; font-size: 11px; cursor: pointer;">عبقري (9x9)</button>
                        </div>

                        <!-- Stages Grid Container -->
                        <div id="mdStagesGrid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; overflow-y: auto; padding: 6px 2px; max-height: 55vh;">
                            <!-- Populated dynamically -->
                        </div>
                    </div>
                </div>

                <!-- VICTORY MODAL -->
                <div id="mdWinModal" style="display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.65); backdrop-filter: blur(6px); z-index: 110; align-items: center; justify-content: center; padding: 20px; box-sizing: border-box; border-radius: 20px;">
                    <div style="background: #FFFFFF; border: 4px solid #4CAF50; border-radius: 26px; padding: 22px; width: 100%; max-width: 320px; text-align: center; box-shadow: 0 12px 36px rgba(0,0,0,0.25); animation: popBounce 0.5s ease;">
                        <div style="font-size: 54px; margin-bottom: 8px;">🐱🎉</div>
                        <h2 style="color: #2E7D32; font-size: 22px; font-weight: 900; margin: 0 0 4px;">مياو رائع! انتصار!</h2>
                        <p style="color: #66BB6A; font-size: 13px; font-weight: bold; margin: 0 0 12px;">توزيع عبقري وصحيح 100%!</p>
                        
                        <div style="display: flex; justify-content: center; gap: 6px; font-size: 26px; margin-bottom: 12px;">
                            <span id="mdStar1">⭐</span>
                            <span id="mdStar2">⭐</span>
                            <span id="mdStar3">⭐</span>
                        </div>

                        <div style="background: #F1F8E9; border-radius: 14px; padding: 10px; margin-bottom: 16px; font-size: 13px; color: #33691E;">
                            <div>⏱️ الوقت المستغرق: <strong id="mdWinTime">00:00</strong></div>
                            <div>🐟 الأسماك الذهبية: <strong id="mdWinFish">3 / 3</strong></div>
                            <div>🏆 مجموع النقاط: <strong id="mdWinScore">0</strong></div>
                        </div>

                        <div style="display: flex; gap: 8px;">
                            <button id="mdWinNextBtn" style="flex: 2; background: linear-gradient(135deg, #4CAF50, #2E7D32); color: white; border: none; padding: 10px; border-radius: 14px; font-weight: 900; font-size: 14px; cursor: pointer; box-shadow: 0 3px 0 #1B5E20;">
                                المرحلة التالية ➡️
                            </button>
                            <button id="mdWinReplayBtn" style="flex: 1; background: #ECEFF1; color: #455A64; border: none; padding: 10px; border-radius: 14px; font-weight: 900; font-size: 14px; cursor: pointer;">
                                🔄 إعادة
                            </button>
                        </div>
                    </div>
                </div>

                <!-- GAME OVER / OUT OF TREATS MODAL -->
                <div id="mdFailModal" style="display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.65); backdrop-filter: blur(6px); z-index: 110; align-items: center; justify-content: center; padding: 20px; box-sizing: border-box; border-radius: 20px;">
                    <div style="background: #FFFFFF; border: 4px solid #EF5350; border-radius: 26px; padding: 22px; width: 100%; max-width: 320px; text-align: center; box-shadow: 0 12px 36px rgba(0,0,0,0.25);">
                        <div style="font-size: 46px; margin-bottom: 6px;">😿💔</div>
                        <h2 style="color: #C62828; font-size: 20px; font-weight: 900; margin: 0 0 6px;">أُكلت جميع الأسماك!</h2>
                        <p style="color: #78909C; font-size: 12px; margin: 0 0 16px;">وضعت قطة في مكان غير صحيح 3 مرات! تذكر: قطة واحدة في كل صف وعمود ومنطقة، والقطط لا تتلامس أبداً!</p>

                        <div style="display: flex; gap: 8px;">
                            <button id="mdFailRetryBtn" style="flex: 1; background: linear-gradient(135deg, #EF5350, #C62828); color: white; border: none; padding: 10px; border-radius: 14px; font-weight: 900; font-size: 14px; cursor: pointer; box-shadow: 0 3px 0 #B71C1C;">
                                إعادة المحاولة 🔄
                            </button>
                            <button id="mdFailContinueBtn" style="flex: 1; background: #ECEFF1; color: #455A64; border: none; padding: 10px; border-radius: 14px; font-weight: 900; font-size: 14px; cursor: pointer;">
                                إكمال اللعب 🐾
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        `;

        container.innerHTML = html;

        // Elements
        const boardEl = document.getElementById('mdBoard');
        const levelNumEl = document.getElementById('mdLevelNum');
        const scoreNumEl = document.getElementById('mdScoreNum');
        const catTrackEl = document.getElementById('mdCatTrack');
        const fishTreatsEl = document.getElementById('mdFishTreats');
        const timerEl = document.getElementById('mdTimer');
        const undoBtn = document.getElementById('mdUndoBtn');
        const resetBtn = document.getElementById('mdResetBtn');
        const hintBtn = document.getElementById('mdHintBtn');
        const stagesBtn = document.getElementById('mdStagesBtn');
        const stagesModal = document.getElementById('mdStagesModal');
        const closeStagesBtn = document.getElementById('mdCloseStagesBtn');
        const stagesGrid = document.getElementById('mdStagesGrid');
        const winModal = document.getElementById('mdWinModal');
        const failModal = document.getElementById('mdFailModal');
        const winNextBtn = document.getElementById('mdWinNextBtn');
        const winReplayBtn = document.getElementById('mdWinReplayBtn');
        const failRetryBtn = document.getElementById('mdFailRetryBtn');
        const failContinueBtn = document.getElementById('mdFailContinueBtn');

        // Timer
        function startTimer() {
            clearInterval(timerInterval);
            timerSeconds = 0;
            timerEl.textContent = '00:00';
            timerInterval = setInterval(() => {
                if (gameActive) {
                    timerSeconds++;
                    timerEl.textContent = formatTime(timerSeconds);
                }
            }, 1000);
        }

        // Render Fish Treats (Lives)
        function updateFishTreatsUI() {
            let fishStr = '';
            for (let i = 0; i < maxHearts; i++) {
                if (i < heartsLeft) {
                    fishStr += '<span style="opacity: 1;">🐟</span>';
                } else {
                    fishStr += '<span style="opacity: 0.22; filter: grayscale(1);">🐟</span>';
                }
            }
            fishTreatsEl.innerHTML = fishStr;
        }

        // Cross SVG matching exact shape in uploaded reference (rounded capsule cross)
        function getCrossSVG(color = '#FFFFFF') {
            return `<svg viewBox="0 0 100 100" style="width: 70%; height: 70%; display: block; filter: drop-shadow(0 2px 3px rgba(0,0,0,0.18)); pointer-events: none;">
                <line x1="20" y1="20" x2="80" y2="80" stroke="${color}" stroke-width="21" stroke-linecap="round" />
                <line x1="80" y1="20" x2="20" y2="80" stroke="${color}" stroke-width="21" stroke-linecap="round" />
            </svg>`;
        }

        // Render Top Cat Track Silhouettes
        function updateCatTrackUI() {
            const lvl = LEVELS_DATA[currentLevelIndex];
            const N = lvl.size;
            catTrackEl.innerHTML = '';

            // Count cats in each region
            const placedCatsInRegion = new Set();
            for (let r = 0; r < N; r++) {
                for (let c = 0; c < N; c++) {
                    if (board[r][c] === 2) {
                        placedCatsInRegion.add(lvl.grid[r][c]);
                    }
                }
            }

            for (let reg = 0; reg < N; reg++) {
                const isPlaced = placedCatsInRegion.has(reg);
                const catItem = document.createElement('div');
                catItem.style.width = '24px';
                catItem.style.height = '24px';
                catItem.style.display = 'flex';
                catItem.style.alignItems = 'center';
                catItem.style.justifyContent = 'center';
                catItem.style.transition = 'transform 0.2s';

                if (isPlaced) {
                    catItem.innerHTML = `<span style="font-size: 19px; line-height: 1;">🐱</span>`;
                    catItem.style.transform = 'scale(1.15)';
                } else {
                    catItem.innerHTML = `<span style="font-size: 16px; opacity: 0.3; filter: grayscale(1);">🐱</span>`;
                }
                catTrackEl.appendChild(catItem);
            }
        }

        // Level Loader
        function loadLevel(index) {
            currentLevelIndex = index;
            localStorage.setItem('meowdoku_current_level', index.toString());

            const lvl = LEVELS_DATA[currentLevelIndex];
            const N = lvl.size;

            levelNumEl.textContent = lvl.id;
            scoreNumEl.textContent = score;

            // Reset board
            board = Array.from({length: N}, () => new Array(N).fill(0));
            boardHistory = [];
            heartsLeft = maxHearts;
            mistakes = 0;
            gameActive = true;
            winModal.style.display = 'none';
            failModal.style.display = 'none';
            stagesModal.style.display = 'none';

            updateFishTreatsUI();
            updateCatTrackUI();
            startTimer();
            renderBoard(true);
        }

        // Update DOM for a single cell without rebuilding the grid (instant, zero-lag)
        function updateCellDOM(r, c) {
            const cell = boardEl.querySelector(`.md-cell[data-row="${r}"][data-col="${c}"]`);
            if (!cell) return;
            const val = board[r][c];
            if (val === 2) {
                const cellSize = cell.offsetWidth || 50;
                const emojiSize = Math.floor(cellSize * 0.72);
                cell.innerHTML = `<div style="font-size: ${emojiSize}px; line-height: 1; user-select: none; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.18)); pointer-events: none;">🐱</div>`;
            } else if (val === 1) {
                cell.innerHTML = getCrossSVG('#FFFFFF');
            } else if (val === 3) {
                cell.innerHTML = getCrossSVG('#EF4444');
            } else {
                cell.innerHTML = '';
            }
        }

        // Apply drag action to a cell
        function applyDragToCell(r, c) {
            const lvl = LEVELS_DATA[currentLevelIndex];
            const N = lvl.size;
            if (r < 0 || r >= N || c < 0 || c >= N) return;
            const val = board[r][c];

            if (dragAction === 'cross') {
                if (val === 0) {
                    board[r][c] = 1;
                    updateCellDOM(r, c);
                    playPurrThrottled();
                }
            } else if (dragAction === 'erase') {
                if (val === 1) {
                    board[r][c] = 0;
                    updateCellDOM(r, c);
                    playPurrThrottled();
                }
            }
        }

        // Interpolate line between previous and current cell to ensure 100% coverage even when swiping fast
        function applyDragToLine(r1, c1, r2, c2) {
            const dr = Math.abs(r2 - r1);
            const dc = Math.abs(c2 - c1);
            const sr = r1 < r2 ? 1 : -1;
            const sc = c1 < c2 ? 1 : -1;
            let err = dr - dc;
            let currR = r1;
            let currC = c1;

            while (true) {
                applyDragToCell(currR, currC);
                if (currR === r2 && currC === c2) break;
                const e2 = 2 * err;
                if (e2 > -dc) {
                    err -= dc;
                    currR += sr;
                }
                if (e2 < dr) {
                    err += dr;
                    currC += sc;
                }
            }
        }

        // Render Board Grid matching exact screenshot (rounded tiles, gaps, solid region colors)
        function renderBoard(rebuild = false) {
            const lvl = LEVELS_DATA[currentLevelIndex];
            const N = lvl.size;

            const containerWidth = Math.min(window.innerWidth - 32, 400);
            const gap = 3.5;
            const totalGaps = (N - 1) * gap + 12; // 12 for padding
            const cellSize = Math.floor((containerWidth - totalGaps) / N);
            const boardPx = cellSize * N + (N - 1) * gap;

            boardEl.style.width = `${boardPx}px`;
            boardEl.style.height = `${boardPx}px`;
            boardEl.style.gridTemplateColumns = `repeat(${N}, ${cellSize}px)`;
            boardEl.style.gridTemplateRows = `repeat(${N}, ${cellSize}px)`;

            // Fast path: if cells already built and not forced rebuild, just update their display
            if (!rebuild && boardEl.children.length === N * N) {
                for (let r = 0; r < N; r++) {
                    for (let c = 0; c < N; c++) {
                        updateCellDOM(r, c);
                    }
                }
                updateCatTrackUI();
                return;
            }

            boardEl.innerHTML = '';

            for (let r = 0; r < N; r++) {
                for (let c = 0; c < N; c++) {
                    const cell = document.createElement('div');
                    cell.classList.add('md-cell');
                    cell.dataset.row = r;
                    cell.dataset.col = c;
                    cell.style.width = `${cellSize}px`;
                    cell.style.height = `${cellSize}px`;
                    cell.style.borderRadius = `${Math.max(5, Math.floor(cellSize * 0.18))}px`;
                    cell.style.display = 'flex';
                    cell.style.alignItems = 'center';
                    cell.style.justifyContent = 'center';
                    cell.style.position = 'relative';
                    cell.style.boxSizing = 'border-box';
                    cell.style.cursor = 'pointer';
                    cell.style.direction = 'ltr';
                    cell.style.boxShadow = 'inset 0 1px 1px rgba(255,255,255,0.4), 0 1.5px 3px rgba(0,0,0,0.06)';
                    cell.style.touchAction = 'none';

                    // Solid distinct region color
                    const regId = lvl.grid[r][c];
                    cell.style.backgroundColor = REGION_COLORS[regId % REGION_COLORS.length];

                    // Value rendering
                    const val = board[r][c];
                    if (val === 2) {
                        const emojiSize = Math.floor(cellSize * 0.72);
                        cell.innerHTML = `<div style="font-size: ${emojiSize}px; line-height: 1; user-select: none; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.18)); pointer-events: none;">🐱</div>`;
                    } else if (val === 1) {
                        cell.innerHTML = getCrossSVG('#FFFFFF');
                    } else if (val === 3) {
                        cell.innerHTML = getCrossSVG('#EF4444');
                    }

                    // INTERACTION EVENTS: Single Click = X, Double Click = Cat, Drag = smooth continuous paint
                    cell.addEventListener('pointerdown', (e) => {
                        e.preventDefault();
                        if (!gameActive) return;

                        isDragging = true;
                        dragMoved = false;
                        dragStartX = e.clientX;
                        dragStartY = e.clientY;
                        dragStartCell = { r, c };
                        lastProcessedCell = null;

                        const currentVal = board[r][c];
                        if (currentVal === 1) {
                            dragAction = 'erase';
                        } else if (currentVal === 0) {
                            dragAction = 'cross';
                        } else {
                            dragAction = 'none';
                        }

                        handleCellPointerDown(r, c);
                    });

                    boardEl.appendChild(cell);
                }
            }

            updateCatTrackUI();
        }

        // Pointer Click & Double Click Handling
        function handleCellPointerDown(r, c) {
            const now = Date.now();
            const isSame = lastClickedCell && lastClickedCell.r === r && lastClickedCell.c === c;
            const elapsed = now - lastClickTime;

            if (isSame && elapsed < 280) {
                // DOUBLE CLICK: Place Cat or Red Cross if wrong!
                if (clickTimer) {
                    clearTimeout(clickTimer);
                    clickTimer = null;
                }
                lastClickTime = 0;
                lastClickedCell = null;
                executeDoubleClick(r, c);
            } else {
                // First click: queue single click
                if (clickTimer) {
                    clearTimeout(clickTimer);
                }
                lastClickTime = now;
                lastClickedCell = { r, c };

                clickTimer = setTimeout(() => {
                    clickTimer = null;
                    lastClickedCell = null;
                    if (!dragMoved) {
                        executeSingleClick(r, c);
                    }
                }, 230);
            }
        }

        // Global pointer move to handle continuous dragging across both touch and mouse seamlessly
        function handleGlobalPointerMove(e) {
            if (!isDragging || !gameActive || dragAction === 'none') return;

            const dist = Math.hypot(e.clientX - dragStartX, e.clientY - dragStartY);
            if (!dragMoved && dist > 5) {
                dragMoved = true;
                if (clickTimer) {
                    clearTimeout(clickTimer);
                    clickTimer = null;
                }
                lastClickedCell = null;
                lastClickTime = 0;

                saveHistory();

                if (dragStartCell) {
                    applyDragToCell(dragStartCell.r, dragStartCell.c);
                    lastProcessedCell = { r: dragStartCell.r, c: dragStartCell.c };
                }
            }

            if (dragMoved) {
                const el = document.elementFromPoint(e.clientX, e.clientY);
                const cellEl = el ? el.closest('.md-cell') : null;
                if (cellEl && boardEl.contains(cellEl)) {
                    const cr = parseInt(cellEl.dataset.row);
                    const cc = parseInt(cellEl.dataset.col);
                    if (!isNaN(cr) && !isNaN(cc)) {
                        if (lastProcessedCell) {
                            applyDragToLine(lastProcessedCell.r, lastProcessedCell.c, cr, cc);
                        } else {
                            applyDragToCell(cr, cc);
                        }
                        lastProcessedCell = { r: cr, c: cc };
                    }
                }
            }
        }

        // Global pointer up to finalize drag
        function handleGlobalPointerUp() {
            if (isDragging && dragMoved) {
                checkVictoryCondition();
            }
            isDragging = false;
            dragMoved = false;
            dragStartCell = null;
            lastProcessedCell = null;
        }

        window.addEventListener('pointermove', handleGlobalPointerMove);
        window.addEventListener('pointerup', handleGlobalPointerUp);
        window.addEventListener('pointercancel', handleGlobalPointerUp);

        // SINGLE CLICK: Toggle White Cross (✕)
        function executeSingleClick(r, c) {
            if (dragMoved) return;
            saveHistory();
            const currentVal = board[r][c];

            if (currentVal === 1 || currentVal === 3) {
                // Already a cross (white or red) -> clear it
                board[r][c] = 0;
                playPurr();
            } else if (currentVal === 0) {
                // Empty -> place white cross
                board[r][c] = 1;
                playPurr();
            } else if (currentVal === 2) {
                // Has Cat -> clear it
                board[r][c] = 0;
                playPurr();
            }

            updateCellDOM(r, c);
            updateCatTrackUI();
            checkVictoryCondition();
        }

        // DOUBLE CLICK: Place Cat 🐱 or Red Cross if wrong!
        function executeDoubleClick(r, c) {
            if (dragMoved) return;
            saveHistory();
            const currentVal = board[r][c];

            if (currentVal === 2) {
                // Already Cat -> remove it
                board[r][c] = 0;
                playPurr();
                updateCellDOM(r, c);
                updateCatTrackUI();
            } else if (currentVal === 3) {
                // Already Red Cross -> remove it
                board[r][c] = 0;
                playPurr();
                updateCellDOM(r, c);
            } else {
                const lvl = LEVELS_DATA[currentLevelIndex];
                const isCorrect = (lvl.solution[r] === c);

                if (isCorrect) {
                    // Correct placement: Place Cat 🐱!
                    board[r][c] = 2;
                    playMeow();
                    updateCellDOM(r, c);
                    updateCatTrackUI();
                    const targetCell = boardEl.querySelector(`.md-cell[data-row="${r}"][data-col="${c}"]`);
                    if (targetCell) {
                        targetCell.style.animation = 'popBounce 0.25s ease-out';
                    }
                    checkVictoryCondition();
                    return;
                } else {
                    // Incorrect placement: Place Red Cross and deduct 1 fish life!
                    board[r][c] = 3;
                    playErrorSound();
                    heartsLeft = Math.max(0, heartsLeft - 1);
                    mistakes++;
                    updateFishTreatsUI();

                    updateCellDOM(r, c);
                    const targetCell = boardEl.querySelector(`.md-cell[data-row="${r}"][data-col="${c}"]`);
                    if (targetCell) {
                        targetCell.style.animation = 'shakeEffect 0.35s ease-out';
                    }

                    if (heartsLeft === 0) {
                        handleGameOver();
                        return;
                    }
                    checkVictoryCondition();
                    return;
                }
            }

            checkVictoryCondition();
        }

        // Conflict Detection
        function getBoardConflicts() {
            const lvl = LEVELS_DATA[currentLevelIndex];
            const N = lvl.size;
            const conflicts = new Set();

            const cats = [];
            for (let r = 0; r < N; r++) {
                for (let c = 0; c < N; c++) {
                    if (board[r][c] === 2) {
                        cats.push({ r, c, reg: lvl.grid[r][c] });
                    }
                }
            }

            for (let i = 0; i < cats.length; i++) {
                for (let j = i + 1; j < cats.length; j++) {
                    const c1 = cats[i];
                    const c2 = cats[j];

                    const sameRow = c1.r === c2.r;
                    const sameCol = c1.c === c2.c;
                    const sameReg = c1.reg === c2.reg;
                    const touching = Math.abs(c1.r - c2.r) <= 1 && Math.abs(c1.c - c2.c) <= 1;

                    if (sameRow || sameCol || sameReg || touching) {
                        conflicts.add(`${c1.r},${c1.c}`);
                        conflicts.add(`${c2.r},${c2.c}`);
                    }
                }
            }

            return conflicts;
        }

        // Save history for undo
        function saveHistory() {
            boardHistory.push(JSON.parse(JSON.stringify(board)));
            if (boardHistory.length > 30) boardHistory.shift();
        }

        // Check Victory
        function checkVictoryCondition() {
            const lvl = LEVELS_DATA[currentLevelIndex];
            const N = lvl.size;

            let catCount = 0;
            const rowCount = new Array(N).fill(0);
            const colCount = new Array(N).fill(0);
            const regCount = new Array(N).fill(0);

            for (let r = 0; r < N; r++) {
                for (let c = 0; c < N; c++) {
                    if (board[r][c] === 2) {
                        catCount++;
                        rowCount[r]++;
                        colCount[c]++;
                        regCount[lvl.grid[r][c]]++;
                    }
                }
            }

            if (catCount !== N) return;

            for (let i = 0; i < N; i++) {
                if (rowCount[i] !== 1 || colCount[i] !== 1 || regCount[i] !== 1) return;
            }

            const conflicts = getBoardConflicts();
            if (conflicts.size > 0) return;

            handleVictory();
        }

        function handleVictory() {
            gameActive = false;
            clearInterval(timerInterval);
            playSuccessSound();

            let stars = 3;
            if (mistakes === 1) stars = 2;
            else if (mistakes >= 2) stars = 1;

            score += Math.max(50, 200 - timerSeconds * 2 + stars * 50);
            localStorage.setItem('meowdoku_score', score.toString());
            scoreNumEl.textContent = score;

            // Save progress
            let progress = JSON.parse(localStorage.getItem('meowdoku_progress') || '{}');
            const lvlId = LEVELS_DATA[currentLevelIndex].id;
            const prev = progress[lvlId] || { stars: 0, bestTime: 999999 };
            progress[lvlId] = {
                stars: Math.max(prev.stars, stars),
                bestTime: Math.min(prev.bestTime, timerSeconds)
            };
            const nextLvlId = lvlId + 1;
            if (nextLvlId <= LEVELS_DATA.length && !progress[nextLvlId]) {
                progress[nextLvlId] = { stars: 0, bestTime: 999999, unlocked: true };
            }
            localStorage.setItem('meowdoku_progress', JSON.stringify(progress));

            document.getElementById('mdWinTime').textContent = formatTime(timerSeconds);
            document.getElementById('mdWinFish').textContent = `${heartsLeft} / ${maxHearts}`;
            document.getElementById('mdWinScore').textContent = score;

            document.getElementById('mdStar1').textContent = stars >= 1 ? '⭐' : '☆';
            document.getElementById('mdStar2').textContent = stars >= 2 ? '⭐' : '☆';
            document.getElementById('mdStar3').textContent = stars >= 3 ? '⭐' : '☆';

            winModal.style.display = 'flex';
        }

        function handleGameOver() {
            gameActive = false;
            failModal.style.display = 'flex';
        }

        // Toolbar Buttons
        undoBtn.addEventListener('click', () => {
            if (boardHistory.length > 0) {
                board = boardHistory.pop();
                playPurr();
                renderBoard();
            }
        });

        resetBtn.addEventListener('click', () => {
            playPurr();
            loadLevel(currentLevelIndex);
        });

        hintBtn.addEventListener('click', () => {
            const lvl = LEVELS_DATA[currentLevelIndex];
            const N = lvl.size;
            playMeow();

            let wrongCell = null;
            for (let r = 0; r < N; r++) {
                for (let c = 0; c < N; c++) {
                    if ((board[r][c] === 2 && lvl.solution[r] !== c) || board[r][c] === 3) {
                        wrongCell = { r, c };
                        break;
                    }
                }
                if (wrongCell) break;
            }

            if (wrongCell) {
                alert(`💡 تلميح: انتبه للعلامة الخاطئة في الصف ${wrongCell.r + 1} والعمود ${wrongCell.c + 1}!`);
                return;
            }

            for (let r = 0; r < N; r++) {
                const targetC = lvl.solution[r];
                if (board[r][targetC] !== 2) {
                    saveHistory();
                    board[r][targetC] = 2;
                    renderBoard();
                    checkVictoryCondition();
                    alert(`💡 تلميح: تم وضع قطة مؤكدة في الصف ${r + 1} والعمود ${targetC + 1}!`);
                    return;
                }
            }
        });

        // Stages Modal
        function renderStagesGrid(filter = 'all') {
            stagesGrid.innerHTML = '';
            const progress = JSON.parse(localStorage.getItem('meowdoku_progress') || '{}');

            LEVELS_DATA.forEach((lvl, idx) => {
                if (filter !== 'all' && lvl.difficulty !== filter) return;

                const lvlCard = document.createElement('div');
                const lvlProg = progress[lvl.id] || {};
                const isUnlocked = lvl.id === 1 || lvlProg.stars > 0 || lvlProg.unlocked;

                lvlCard.style.cssText = `
                    background: ${isUnlocked ? (idx === currentLevelIndex ? '#FFF3E0' : '#FFFFFF') : '#EFEBE4'};
                    border: 2px solid ${isUnlocked ? (idx === currentLevelIndex ? '#F7A361' : '#E0D8CC') : '#D7CCC8'};
                    border-radius: 14px;
                    padding: 8px 4px;
                    text-align: center;
                    cursor: ${isUnlocked ? 'pointer' : 'not-allowed'};
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 3px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.03);
                `;

                let starsText = isUnlocked ? '☆☆☆' : '🔒';
                if (lvlProg.stars === 3) starsText = '⭐⭐⭐';
                else if (lvlProg.stars === 2) starsText = '⭐⭐☆';
                else if (lvlProg.stars === 1) starsText = '⭐☆☆';

                lvlCard.innerHTML = `
                    <span style="font-size: 15px; font-weight: 900; color: ${isUnlocked ? '#5D4037' : '#BCAAA4'};">${lvl.id}</span>
                    <span style="font-size: 9.5px; color: #8D6E63; font-weight: bold;">${lvl.size}x${lvl.size}</span>
                    <span style="font-size: 10px;">${starsText}</span>
                `;

                if (isUnlocked) {
                    lvlCard.addEventListener('click', () => {
                        playMeow();
                        loadLevel(idx);
                    });
                }

                stagesGrid.appendChild(lvlCard);
            });
        }

        stagesBtn.addEventListener('click', () => {
            playPurr();
            renderStagesGrid('all');
            stagesModal.style.display = 'flex';
        });

        closeStagesBtn.addEventListener('click', () => {
            stagesModal.style.display = 'none';
        });

        document.querySelectorAll('.md-tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.md-tab-btn').forEach(b => {
                    b.classList.remove('active');
                    b.style.background = '#EFEBE4';
                    b.style.color = '#5D4037';
                });
                btn.classList.add('active');
                btn.style.background = '#F7A361';
                btn.style.color = 'white';
                renderStagesGrid(btn.dataset.tab);
            });
        });

        winNextBtn.addEventListener('click', () => {
            playMeow();
            if (currentLevelIndex < LEVELS_DATA.length - 1) {
                loadLevel(currentLevelIndex + 1);
            } else {
                loadLevel(0);
            }
        });

        winReplayBtn.addEventListener('click', () => {
            playPurr();
            loadLevel(currentLevelIndex);
        });

        failRetryBtn.addEventListener('click', () => {
            playPurr();
            loadLevel(currentLevelIndex);
        });

        failContinueBtn.addEventListener('click', () => {
            failModal.style.display = 'none';
            gameActive = true;
            heartsLeft = 1;
            updateFishTreatsUI();
        });

        function onResize() {
            if (container.contains(boardEl)) {
                renderBoard(true);
            }
        }
        window.addEventListener('resize', onResize);

        function cleanup() {
            clearInterval(timerInterval);
            if (clickTimer) clearTimeout(clickTimer);
            window.removeEventListener('pointermove', handleGlobalPointerMove);
            window.removeEventListener('pointerup', handleGlobalPointerUp);
            window.removeEventListener('pointercancel', handleGlobalPointerUp);
            window.removeEventListener('resize', onResize);
            container.removeEventListener('game-exit', cleanup);
        }
        container.addEventListener('game-exit', cleanup);

        loadLevel(currentLevelIndex);
    };
})();
