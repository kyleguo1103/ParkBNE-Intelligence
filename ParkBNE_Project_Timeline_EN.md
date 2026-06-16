# ParkBNE Intelligence — Complete Project Timeline

---

## Phase 0: Problem Discovery and Report Writing (Project Starting Point)

### Goal
To explore the potential value of Brisbane parking data, identify the information needs of drivers at different stages of their journey, and lay the research foundation for subsequent design decisions.

### Data Sources and Literature Support
The team selected two datasets from the Brisbane City Council (BCC) open data portal:

**Dataset 1: Brisbane Parking Meter Locations**
- 945 records covering all paid parking meter zones in the inner-city area
- Includes meter ID, payment category, street, suburb, maximum stay, operating hours, tariff zone, after-hours pricing, and number of bays
- Positioned by the team as the "base layer" of any parking information tool — telling users where to go, how much it costs, and what the rules are

**Dataset 2: Parking Occupancy Forecasting**
- 1,198,170 records across 610 unique zones, spanning January to March 2026
- Provides hourly predicted occupancy on a 0–5 scale, with peak volume between 9:00 AM and 1:00 PM
- Positioned as a "demand estimation tool," but with a key limitation: 335 of the 945 meter zones had no corresponding occupancy forecast data

**Academic Literature Reviewed**
- Shoup (2006): The phenomenon and cost of drivers "cruising for parking," supporting the argument that the absence of real-time information leads to inefficiency
- Li et al. (2024) / Lubrich (2025): Variability in parking data quality and coverage limitations
- Rodríguez et al. (2024): Differences in user parking behaviour under varying levels of information quality
- Wu & Konstantinidis (2025): Trust and reputation in data sharing, supporting the argument that inaccurate predictive data undermines user trust
- Raihan et al. (2024): Digital inequity and the digital divide, flagging the need for accessible design
- Wang & Liu (2022): Spatiotemporal patterns of parking problems and their relationship with built environment features in Brisbane — a directly relevant local study
- Xiao et al. (2023): A survey of parking prediction in smart cities, including Graph Neural Network (GNN) approaches

### Core Problems Identified
1. **Data is not real-time**: Predicted data does not reflect actual conditions, failing to meet the immediate needs of drivers already on the road
2. **Information fragmentation**: Parking information is scattered with no single platform consolidating it for users
3. **Missing parking type information**: The datasets do not cover disabled bays, motorcycle bays, EV charging stations, or other specialised parking types
4. **Uneven geographic coverage**: Data is concentrated in the inner city, with weak coverage of outer suburbs
5. **Lack of user perspective**: The data tells us where cars are, but not why drivers choose those spots

### Initial Research Question
> "How might we investigate what parking information Brisbane commuters and visitors need, at different stages of their journey, when current open data is limited to static meter locations and forecasted occupancy?"

---

## Phase 1: Prototype V1 — Driver Navigation Tool (B2C Direction)

### Timeline
Approximately March to early April 2026

### Goal and Direction
To serve everyday drivers (B2C) by helping them find suitable parking before or during their journey.

### Product Form
- A desktop-first web application built with HTML, CSS, and JavaScript
- **Two core modes:**
  - **Plan Ahead (pre-journey planning)**: Users at home or in the office can search parking zones in advance, filtering by suburb, price, maximum stay, and predicted occupancy
  - **On the Road (live navigation)**: GPS-integrated mode to help drivers already en route quickly find nearby available bays
- Integrated real GPS coordinates for all 945 BCC parking meter zones
- Featured an interactive map (Leaflet.js), filtering controls, a zone detail panel, and driving route navigation

### Design Rationale
- The "two separate modes" design came directly from problem analysis: pre-journey planning and on-the-road searching represent fundamentally different information needs and mental models, so they required separate, dedicated experiences
- Data transparency was a deliberate design choice: rather than showing only "available/not available," the team chose to surface more detail (maximum stay, payment method, hourly rate) because the data analysis showed users need complete information to make confident decisions

### User Testing and Feedback Collection
Informal user testing was conducted with 4 students via a live demo, collecting qualitative feedback on usability, trust in occupancy predictions, and desired features.

**Key Findings:**
- Users questioned whether the occupancy data was real-time, expressing doubt about prediction accuracy
- Users suggested adding a behaviour-tracking system to enable personalised recommendations
- Users raised the idea of expanding coverage to enclosed parking facilities
- **The core trust issue**: The gap between predicted and actual availability was identified as the single most critical factor undermining user trust

---

## Phase 2: The Pivot — Identifying the Turning Point

### Timeline
13 April 2026 (documented in team chat logs)

### What Happened
During a Studio class, the tutor gave a critical piece of feedback on the V1 prototype:

> "Users are unlikely to use this feature if the data is not real-time."

This feedback struck at the core weakness of V1 — predictive data cannot satisfy drivers' need for real-time accuracy, which severely undermines the value proposition of a B2C product.

### Internal Team Discussion
Jingkai (team member) proposed a pivot in the group chat:

> "We want to utilise our existing rough forecasts to convert the data from B2C to B2B, making it available for commercial site selection purposes, as business users are generally less sensitive to real-time data than ordinary users. These two existing datasets can provide footfall-related information for commercial site selection. By combining this with other factors — such as whether the surrounding area is a residential or commercial zone — we can offer more detailed insights, such as whether it is feasible to install charging points or whether the location is suitable for commercial development."

Dong (lead developer) acknowledged the strategic advantage:
> "Yeah, commercial use doesn't really need real-time data — just general data to give them an insight."

Dong also flagged the cost of pivoting:
> "If we switch completely, this means we are completely entirely changing our whole project — that's like 6 weeks gone out the window. And we made our problem framing report based on what we are working with now. So if we change completely, does that mean the problem framing report is just invalid and not relevant to the new changed topic?"

### Resolution
Nan (team member) proposed a middle path:
> "That's alright, though. I think our projects can coexist. In other words, our project can provide parking planning information to users while also providing data to businesses."

Dong immediately decided to act on this:
> "Yeah, I'll try to see if I can add another panel in the prototype — a view for the business and commercial site."

### Root Causes of the Pivot
| Driving Factor | Detail |
|---|---|
| Fundamental data limitation | BCC data is predictive, not real-time — it cannot support immediate driver decision-making |
| Tutor feedback | Explicitly identified the absence of real-time data as a fatal flaw for a B2C product |
| User testing findings | All 4 test users independently questioned the real-time nature of the data |
| Opportunity reframing | Predictive data still holds value for commercial users, who make long-term strategic decisions rather than instant ones |

---

## Phase 3: Prototype V2 — Dual-Mode B2C + B2B

### Timeline
13–20 April 2026

### Goal
To retain the existing driver-facing tool while adding a standalone "Business Insights" panel, enabling both modes to coexist.

### New Features Added
- A new "Business Insights" panel displaying aggregated parking data and commercially relevant metrics per suburb
- Integration of both datasets (`commercial_data.js` introduced), generating commercial scores for each suburb
- The original Plan Ahead and On the Road modes were retained alongside the new panel

### Literature Shared During This Phase
Nan shared two papers in the team chat on 20 April, providing academic grounding for the shift from a driver tool toward a land-use and commercial analysis tool:
- *The temporality of on-street parking – exploring the role of land-use mix and change on parking dynamics*
- *Function Replacement Decision-Making for Parking Space Renewal Based on Association Rules Mining*

---

## Phase 4: Prototype V3 — Full Focus on Commercial Use

### Timeline
Late April to early May 2026

### Decision: Go All-In on B2B
Following testing and feedback collection on V2, the team decided to fully remove all driver-facing features and reposition the product entirely as a **commercial site intelligence platform**.

**Features Removed:**
- Plan Ahead (pre-journey parking search)
- On the Road (live navigation)
- GPS user location

**Reasons for Removal:**
- Driver-facing features depended on real-time data that the existing datasets could not provide
- Keeping both modes diluted the product's identity and confused users about what the tool was actually for
- Commercial users (investors, developers, business owners) have different accuracy requirements, and predictive data still carries meaningful decision-making value for them

**New Feature Modules Added:**

### Site Intelligence (Commercial Site Scoring)
**Why it exists:** The most fundamental need for commercial users is "which area best suits my business?" — this required a structured, ranked scoring system to make that comparison easy and fast.

**Design rationale:**
- Three analysis filters (Foot Traffic / EV Charging / Commercial Dev) map directly to the three most common commercial decision scenarios: retail/hospitality site selection, EV charging infrastructure placement, and commercial property investment
- Scores are calculated as proxy indicators derived from parking data, not direct measurements — this is an intentional honesty-driven design choice, with built-in tooltip explanations informing users that these are estimates
- Map marker size and colour both scale with the score, letting users instantly perceive spatial distribution patterns
- Clicking a suburb card or map marker opens a detail panel while the map automatically flies to that suburb (flyTo), reinforcing spatial awareness
- An hourly activity bar chart (6:00 AM–9:00 PM) helps commercial users determine peak activity windows — directly relevant to decisions about opening hours or event scheduling
- Auto-generated text recommendations lower the barrier for users who are not comfortable interpreting raw scores
- The export report feature (.txt format) meets the practical workflow needs of commercial users who need to save results or share findings with their team

**Scoring Formula Design:**
| Score Dimension | Calculation Method | Commercial Meaning |
|---|---|---|
| Foot Traffic Score | Occupancy × 60% + Total bays × 40% | Estimates visitor volume to the area |
| EV Suitability Score | Bays per zone + Long-stay zone proportion (4h+) + Available capacity | Assesses physical feasibility of installing charging infrastructure |
| Commercial Dev Score | Average occupancy × 50% + Average parking rate × 50% | High rates + consistent demand signals a commercially active corridor |
| Demand Score | Average predicted occupancy directly converted to a 0–100 scale | Measures overall parking busyness across the suburb |

### Demand Heatmap
**Why it exists:** Commercial decisions are not just about *where* — they also depend on *when*. The heatmap adds a temporal dimension, allowing users to observe how urban activity shifts across the day.

**Design rationale:**
- Each dot represents one real parking meter zone at street level, not a suburb-wide aggregate — preserving high spatial granularity
- A draggable time slider (hours 0–23) updates all dot colours and sizes in real time, letting users "watch the city breathe" throughout the day
- Green/yellow/red colour coding aligns with universal human intuition (traffic light semantics), minimising cognitive load
- Dot size also scales with occupancy (not just colour), improving accessibility for users with colour vision deficiencies
- Hover tooltips reveal the specific street name and exact occupancy value for each zone
- Design rationale: spatial and colour-based information encoding enables users to recognise patterns significantly faster than reading numerical tables (referencing Ware 2004 principles of information visualisation)

### Compare Suburbs
**Why it exists:** Once users have identified two or three candidate areas through Site Intelligence, they need a side-by-side comparison to make a final, informed decision.

**Design rationale:**
- Supports up to three suburbs simultaneously — three is the upper limit of what human working memory can comfortably hold for active comparison
- The best value in each row is automatically highlighted with a ✓ marker, so users do not have to mentally compare numbers themselves
- All 8 metrics include a ⓘ tooltip explanation, maintaining a clean interface while preserving information depth on demand
- A clear-all button enables users to reset quickly and run multiple rounds of comparison

### Feedback
**Why it exists:** The product was still in active iterative development, and the team needed to continuously collect real user experiences to guide future improvements.

**Design rationale:**
- Decision type chips (Café / EV / Retail / Investment etc.) help the team understand the varying needs of different commercial user segments
- A 1–5 star rating system provides quantifiable satisfaction data
- A free-text field capturing "what information is missing" directly points toward the next product improvement priority
- Submitted responses are displayed in real time on the right-hand panel, so users can see that their input has been recorded

---

## Phase 5: Prototype V4 (Final Version) — AI Assistant Added

### Timeline
4 May 2026 (announced by Dong in the team chat)

### What Was Updated
Dong posted in the team chat:
> "Hey guys, sorry for the late update on the prototype, but I've finally fixed and implemented some of the improvements that were suggested to us in the last studio. The AI assistance is also in now so you can try test it out for yourself — I've tested it as well to get some in-depth responses but feel free to test your own thoughts."

### AI Assistant
**Why it exists:** The first three versions still required users to interpret data themselves, creating a learning curve. The AI assistant serves as the "last mile" solution — allowing users unfamiliar with data analysis to simply ask questions in natural language and receive specific, data-grounded recommendations.

**Design rationale:**
- Uses the Qwen3-8B model via the SiliconFlow API rather than a direct Claude API call — a deliberate trade-off between capability and cost
- The AI is injected with a comprehensive system prompt containing all 18 suburbs' scores and data context notes, ensuring responses are grounded in real data rather than generic advice
- Pre-built suggestion prompts ("Which suburb has the highest foot traffic?", etc.) lower the barrier to engagement for first-time users
- A right-side "Data Context" panel shows what data the AI has access to, increasing transparency and trust
- Conversation history is capped at the most recent 20 messages, balancing context window quality against system performance
- Markdown formatting (bold, lists, headers) is rendered in the chat, making AI responses more visually readable
- A status indicator (Ready / Thinking...) provides real-time feedback during AI processing, reducing user anxiety during wait times

### Feedback Received During This Phase
Jingkai tested the update and reported:
> "Thank you Dong. I've tried the AI assistance and it works perfectly. The only concern I might say is the font of the heading is a little bit hard to read for the user. It looks like it has been squished."

Dong responded:
> "Oh yeah you right. I'll do a couple tweaks tomorrow."

Dong was also actively seeking to arrange an interview with a real business infrastructure engineer (through his father's network) to gather professional feedback from an actual target user.

---

## Full Project Evolution Summary

| Version | Timeline | Positioning | Core Features | Reason for Change |
|---|---|---|---|---|
| Problem Framing Report | Project start | Research and analysis | Data analysis, literature review, problem identification | Project starting point |
| V1 Prototype | March – early April | B2C driver tool | Plan Ahead + On the Road navigation | Initial assumption: drivers need parking information |
| V2 Prototype | 13–20 April | Dual-mode B2C + B2B | Added Business Insights panel | Tutor feedback + user testing: lack of real-time data undermines B2C value |
| V3 Prototype | Late April – early May | Full B2B commercial platform | Removed navigation; added heatmap, comparator, and scoring | Dual-mode positioning was unclear; commercial features better leveraged the data |
| V4 Prototype (Final) | 4 May | B2B commercial intelligence platform | Added AI assistant; all features refined | Studio feedback + user testing: users needed a more accessible way to interpret data |

---

## Design Principles That Ran Throughout the Entire Project

1. **Data honesty**: The system consistently communicates to users that all data is predictive, represents car-based activity only, and does not capture public transport users — avoiding over-promising on data capabilities
2. **Progressive disclosure**: Suburb cards show a summary; users must click to expand full details — preventing information overload at the top level
3. **Responsible use of proxy indicators**: Since foot traffic cannot be directly measured, parking data is used as a proxy, and the interface explicitly acknowledges this limitation to the user
4. **Iteration driven by evidence**: Every version update directly corresponded to a specific piece of user feedback or external input — no features were added without a clear rationale

---

*This document is compiled from: the DECO7180 Problem Framing Report (initial submission), internal team Microsoft Teams chat logs (13 April – 4 May 2026), and the final website codebase (app.js / index.html / commercial_data.js / data.js).*
