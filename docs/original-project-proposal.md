# MemPal Box

## 1. What Is This Project?

The MemPal Box is a small device that sits next to your bed. It has two main jobs.

Its first job is to help people who have memory problems, like dementia or Alzheimer's disease. (These are illnesses that make it hard to remember things. They usually happen to older people.) The box helps in three ways:

- It shows a slideshow of family photos with names written on them.
- It plays voice messages at set times to remind the person about things.
- It has a big help button. When the person presses it, the box tells a caregiver that they need help. (A caregiver is someone who takes care of them.)

Its second job is a game called Brain Check. This game quietly watches how a person plays. It looks for tiny clues that can show if their memory and thinking are changing over time.

The box makes its own WiFi network. It also runs its own website, right from the device. Any family member can join the WiFi on their phone and open the website. From there, they can add photos, set reminders, play Brain Check, and look at the results. You don't need to download an app, and you don't need the internet. Anyone in the family can help out, right from their own phone.

## 2. Why We Are Building This

### 2.1 How Big Is the Problem?

Dementia usually starts after age 65. After that, the chance of getting it doubles every five years. For people who live to be 100, the chance can be as high as 41% each year (Bullain & Corrada, 2013). Women get it more often than men, especially after age 90. People who did not finish high school also get it more often (Ganguli et al., 2015).

Here is some hopeful news. A big report from 2020 said that up to 40% of dementia cases around the world might be prevented or slowed down (Livingston et al., 2020). How? By taking care of things like hearing loss, high blood pressure, feeling lonely, not moving enough, and feeling sad for a long time. In 2024, the same group raised that number to almost 45%. They added two more things to watch: high cholesterol and vision loss.

This is the heart of why MemPal matters. If we can spot brain changes early, we have a real chance to help.

### 2.2 Catching It Too Late

Right now, doctors test for dementia with paper tests like the MoCA or MMSE. These tests have problems. They can be unfair to people from different cultures. They only show one moment in time. And doctors usually give them only after someone already thinks something is wrong. By then, the brain may have already changed a lot.

New research shows a better way. The way a person touches a screen can give tiny clues. These clues are called "digital biomarkers." (A biomarker is a sign in your body that tells you about your health. A digital one comes from how you use a device.) These clues can show brain changes years before the usual signs appear. In some tests, games could spot early memory trouble (called mild cognitive impairment, or MCI) almost as well as a blood test. A 2025 study from Rutgers found that games about figuring out rules can spot brain changes with great accuracy.

Catching trouble years earlier means families get more time. More time to plan, to get help, and to slow things down.

### 2.3 The Link Between ADHD and Dementia

ADHD is a condition that makes it hard to pay attention and sit still. New research has found a link between adult ADHD and dementia. One 2023 study followed more than 109,000 people. It found that adults with ADHD were almost 3 times more likely to get dementia (Levine et al., 2023). A big study in Sweden, with 3.5 million people, found something similar. But the link got much weaker once other mental health issues were taken into account. This suggests that years of mental stress may explain a lot of the connection (Dobrosavljevic et al., 2021).

This makes testing tricky. ADHD and early dementia can look the same. Both can make it hard to pay attention, remember things, and plan ahead. So ADHD can act like a "copycat" of dementia (Callahan et al., 2017). The Brain Check game can help tell them apart. It does this by tracking changes over time instead of using just one test. ADHD stays mostly steady. Dementia slowly gets worse.

### 2.4 Why Games Work

The best proof for brain games comes from a 20-year study by the NIH, shared in early 2026. The study found that plain "memory training" does not do much to prevent dementia. But one kind of game did work: speed games. These are games that make you see and react fast, and they get harder as you go. They lowered the risk of getting dementia by up to 25%. This is the science behind the Brain Check game.

## 3. Our Goals

The MemPal Box is about more than memory. It is about keeping people close to the ones they love, and catching brain changes early enough to make a difference. Here is what we want it to do:

- Help people remember the names and faces of the people they love.
- Play reminders using real family voices, not a robot voice.
- Give people one button to call for help, without using a phone.
- Include a fun game that quietly checks how the brain is doing.
- Track changes over time so families and doctors can spot early warning signs.
- Let caregivers run everything from a website on any phone or laptop.
- Be simple to build and easy to share, so it can reach care homes and families everywhere.

## 4. How It Works

### 4.1 Memory Helper Tools

**Photo Mode**

The small screen shows family photos saved on a memory card. Each photo has big, clear words that say who the person is. For example: "This is Sarah — your granddaughter." A big green button lets the person move to the next photo whenever they want. This keeps loved ones present, even on hard days.

**Reminder Mode**

At times the caregiver picks, the box plays a reminder out loud through the speaker. These are real recordings of family members' voices. Research says this works better and feels more comforting than a robot voice.

**Help Button**

A big red button plays a calming message when pressed. At the same time, it sends an alert to the website. The caregiver sees the time it happened and can tap to say they got it. This gives the patient a simple way to reach out, and gives the family peace of mind.

### 4.2 Brain Check: The Thinking Game

Brain Check is a short game on the website. The caregiver can play it, the patient can play it (in the early stages), or they can play together.

**The Science: The N-back Game**

The N-back is a well-known brain test for "working memory." (Working memory is how you hold and use information in your head for a short time.) In the test, you watch things appear one by one. You have to say when the thing you see now matches the thing you saw a few steps back.

The plain test works, but it is boring and tiring. So Brain Check turns it into a fun game instead.

**Making It a Game**

Instead of staring at boring shapes, the player is part of a story. We are thinking about three ideas:

- **The Assembly Line:** You are a quality checker in a factory. You tap the screen if the item now matches the item from a few spots ago.
- **The Barista:** Customers shout out drink orders. You have to make the drink that someone ordered a few customers ago.
- **The Navigator:** A driving game where you dodge shapes that match one from a few screens back.

The game follows four steps that repeat:

1. **Show the item (1 to 1.5 seconds):** A new item slides into the scene with a smooth, steady beat.
2. **Update your memory (in your head):** You forget the oldest item and add the new one.
3. **Take action (data time):** You drag the item to a "Match" or "No Match" zone. This is when the box collects touch data.
4. **Quick feedback:** A small reward for a correct answer, and a gentle "miss" sign if you get it wrong (never mean about it).

**Smart Difficulty**

The player never picks how hard the game is. The box changes the difficulty on its own. It tries to keep the player getting about 80% right. If you get 100%, the game is too easy. If you get below 60%, you might give up. So the box keeps it just right.

**What the Game Measures**

Here is the clever part. Brain Check mostly ignores the score. Instead, it studies how you move your finger. By asking you to drag instead of just tap, it learns a lot about your thinking.

| Clue | What It Shows | How It Is Measured | Why It Matters |
|------|---------------|--------------------|----------------|
| Reaction Time | How fast you first touch after seeing the item | A very precise timer | Slower reactions can be a sign of thinking trouble |
| Shaky Movement | How smooth your drag is | Tracking the path your finger takes | Tiny shakes can mean your memory is tired or unsure |
| Hold Time | How long you hold before letting go | A timer from when you touch to when you let go | Long holds can mean your brain is working harder to decide |
| Changing Your Mind | How often you switch direction mid-move | Spotting when your finger reverses | Switching shows your brain is fighting between two memories |
| Getting Tired | How much your accuracy drops during a game | Tracking your score as the game goes on | A fast drop can mean you have trouble staying focused |

**Results and Tracking Over Time**

After each game (about 3 to 5 minutes), the website shows a simple summary. It lists your score, your average reaction time, and how hard the game got. Over time, it draws lines on a graph for each clue. This lets families and doctors notice slow changes that one doctor visit might miss. All the data stays on the memory card inside the box. You can also save it as a spreadsheet file (called a CSV) to look at later.

## 5. The Caregiver Website

The ESP32 (the little computer brain of the box) makes its own WiFi network. Then it runs a website. The caregiver joins the WiFi on their phone and opens a browser. The website has these pages:

- **Photo Manager** — add family photos and write names and relationships on them.
- **Reminder Scheduler** — set daily or weekly reminders and record or add voice messages.
- **Brain Check** — play the thinking game and see the results.
- **Trends** — look at the graphs over time and save the data as a spreadsheet.
- **Activity Log** — see when buttons were pressed and which reminders played.
- **Help Alerts** — see a live list of help button presses, with times.
- **Settings** — change the WiFi name and password, speaker volume, slideshow speed, and screen brightness.

## 6. What's Inside the Box

The MemPal Box is built from simple, common parts. None of them are hard to find, so almost anyone can build a box and share it with a family that needs one. The Brain Check game needs no extra parts at all. It runs on the caregiver's phone through the website.

| Part | What It Does for the User |
|------|---------------------------|
| ESP32 (WROOM-32) | The main brain. It runs everything and makes the WiFi network. |
| 2.4″ TFT LCD screen | Shows the family photos and the names written on them. |
| DFPlayer Mini MP3 module | Plays the recorded family voices and reminders. |
| Small 8Ω speaker | Lets the patient hear the voices clearly. |
| DS3231 clock module | Keeps time so reminders play at the right moment. |
| MicroSD card | Stores the photos, voice clips, and game results. |
| 3 large arcade buttons | Big, easy-to-press buttons for "next photo" and "help." |
| Breadboard and jumper wires | Hold all the parts together, with no soldering needed. |
| Resistors | Keep the buttons working safely. |
| USB power adapter | Powers the box from any wall outlet. |
| Enclosure (a craft box or case) | Holds everything and makes it friendly to keep by the bed. |

## 7. The Software

All the software is open and free for anyone to use, study, and improve. The project has three parts: the code inside the box (called firmware), the caregiver website, and the Brain Check game. The Brain Check game needs nothing extra. It is just code sent from the same website.

| Part | Built With | Tools | What It Does |
|------|-----------|-------|--------------|
| ESP32 Firmware | Arduino C++ | WiFi.h | Makes the local WiFi network |
| | | WebServer.h | Serves the website and handles data requests |
| | | TFT_eSPI | Runs the screen (photos and text) |
| | | DFRobotDFPlayerMini | Controls the MP3 sound |
| | | RTClib | Reads the time from the clock part |
| | | ArduinoJson | Reads and writes data for the website |
| | | LittleFS | Stores the website files on the ESP32 |
| Caregiver Website | HTML / CSS / JS | Fetch API | Talks to the ESP32 |
| | | CSS Grid + Flexbox | Makes the layout fit any screen |
| | | Web Audio API | Records voice clips in the browser |
| | | FileReader API | Shows photos before you upload them |
| Brain Check Game | HTML / CSS / JS | requestAnimationFrame | Runs the smooth game loop |
| | | Performance.now() | Times touches very precisely |
| | | Touch Events API | Tracks swipe paths and shakes |
| | | Fetch API | Saves game data to the box's memory card |

## 8. The Schedule

The project is planned for 25 days (about 3.5 weeks). The plan assumes 1–2 hours on weekdays and 2–3 hours on weekends. In total, it should take about 25 to 36 hours. The first plan was 21 days. We added 4 more days for the Brain Check game.

| Phase | Days | Hours | Main Tasks |
|-------|------|-------|------------|
| 1. Planning & Gathering Parts | 1–3 | 2–3 hrs | Finish the parts list; gather the parts; set up the Arduino software; format the SD card; collect family photos; record voice reminders |
| 2. Building the Hardware | 4–7 | 4–6 hrs | Wire the ESP32 to the screen, sound module, clock, and buttons; put in the SD card; test each part |
| 3. ESP32 Code | 8–11 | 5–8 hrs | Set up WiFi; serve the website; build the data system; add the screen, sound, and clock; program reminders; add data saving for Brain Check |
| 4. Caregiver Website | 12–14 | 4–5 hrs | Build the website: photo manager, reminder scheduler, activity log, help alerts, and settings |
| 5. Brain Check Game | 15–17 | 4–6 hrs | Build the N-back game in HTML/JS; make the smart difficulty system; collect touch clues; design the summary and graphs |
| 6. Building the Case & Testing | 18–21 | 3–4 hrs | Build and decorate the box; cut holes for the screen, buttons, and speaker; test everything; try it with an older person |
| 7. Writing & Presenting | 22–25 | 3–4 hrs | Write the report with research notes; take photos and a demo video; make a poster or slides; practice a 3-minute pitch |

## 9. Skills You Will Learn

This project helps you build real skills in many areas:

- Wiring circuits and building prototypes (using SPI, I2C, and UART, which are ways for parts to talk to each other)
- Programming small computers with the ESP32 and Arduino
- Making websites (HTML, CSS, JavaScript) and designing how apps share data
- Setting up WiFi and connecting devices
- Designing games and smart difficulty systems
- Pulling useful clues out of touch data
- Designing for real people, especially older users
- Reading science papers and using them to make smart choices
- Writing about your work, making graphs, and keeping good notes

## 10. Ideas for Later

If there is extra time, we could add:

- Phone alerts to the caregiver when the help button is pressed
- A sensor that starts the slideshow when the patient walks up to the box
- A rechargeable battery so the box can be used anywhere
- A simple computer model that learns from the game data to spot trends
- Separate profiles, so many patients in a care home can each have their own photos, reminders, and game history
- A "music mode" that plays calm or favorite songs, which can help dementia patients feel less upset
- A camera that watches face expressions during Brain Check to collect even more clues

## 11. References

Bullain, S. S., & Corrada, M. M. (2013). Dementia in the Oldest Old. *CONTINUUM: Lifelong Learning in Neurology*, 19, 457–469.

Callahan, B. L., Bierstone, D., Stuss, D. T., & Black, S. E. (2017). Adult ADHD: Risk Factor for Dementia or Phenotypic Mimic? *Frontiers in Aging Neuroscience*, 9, 260.

Dobrosavljevic, M., et al. (2021). ADHD as a risk factor for dementia and MCI: A population-based register study. *European Psychiatry*, 65.

Ganguli, M., et al. (2015). Rates and risk factors for progression to incident dementia vary by age. *Neurology*, 84, 72–80.

Leffa, D. T., et al. (2025). Impact of ADHD polygenic risk scores in Alzheimer's disease. *Alzheimer's & Dementia*, 21.

Levine, S. Z., et al. (2023). Adult ADHD and the Risk of Dementia. *JAMA Network Open*, 6, e2338088.

Livingston, G., et al. (2020). Dementia prevention, intervention, and care: 2020 Lancet Commission report. *The Lancet*, 396, 413–446.

McCullagh, C. D., et al. (2001). Risk factors for dementia. *Advances in Psychiatric Treatment*, 7, 24–31.

NIH ACTIVE Study 20-Year Follow-Up (2026). Cognitive speed training and dementia risk reduction.
