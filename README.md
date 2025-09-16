# Grok's Flash Quest: Walmart Rescue Mission

An 8-bit stealth adventure where you must rescue Flash the horse from a Walmart clothes department!

## 🎮 Game Overview

Flash the horse has been captured and is being held in the stockroom of a Walmart clothes department. You must navigate through the store, avoid security guards and store associates, collect the necessary equipment, and escape with Flash to complete your mission.

## 🕹️ Controls

- **Movement**: WASD or Arrow keys
- **Sprint**: Hold Shift (drains stamina)
- **Interact**: Spacebar (hold to pick up items or unlock gates)
- **Calm Flash**: E (after freeing Flash)
- **Hide**: Walk into clothes racks to reduce visibility

## 🎯 Objectives

1. **Collect Equipment** (3 items):
   - 🎯 **Halter** - Located near the entrance clothes racks
   - 🪢 **Lead Rope** - Found near the fitting rooms
   - 🛡️ **Saddle Pad** - Hidden in the back area

2. **Get the Gate Key** 🗝️:
   - Visit Customer Service to obtain the key (shown in blue)

3. **Free Flash** 🐴:
   - Use the Gate Key to unlock Flash's pen (requires 1.2s interaction)

4. **Calm Flash**:
   - Press E near Flash to calm him (0.8s interaction)

5. **Escape Together**:
   - Lead Flash to the green exit at the Garden/Loading Dock

## 🕵️ Stealth Mechanics

- **Guards & Associates**: 3 patrol NPCs with line-of-sight detection
  - 👮 Security Guard (large patrol route)
  - 👩‍💼 Store Associate 1 (clothes section)
  - 👨‍💼 Store Associate 2 (back area)

- **Hiding**: Duck into purple clothes racks to become hidden
- **Detection**: If caught in a guard's yellow vision cone, you get a strike
- **Strikes**: 3 strikes = mission failed
- **Sprinting**: Faster movement but drains stamina and reduces stealth effectiveness

## ⏱️ Timing Mechanics

The game enforces a minimum completion time through:
- **Item Pickup**: 0.67s hold-to-collect for each item
- **Gate Unlock**: 1.2s interaction with progress bar
- **Calm Flash**: 0.8s interaction before Flash will follow
- **Escort Speed**: Flash follows with slight delay, requiring patience

**Minimum possible completion time**: ~4-5 seconds (enforced timing)
**Typical completion time**: 1-3 minutes for new players

## 🎨 Visual Guide

- **Purple Tiles**: Clothes racks (stealth zones)
- **Pink Tiles**: Fitting rooms (solid walls)
- **Blue Tiles**: Customer service area
- **Gray Tiles**: Walls and stockroom
- **Green Tiles**: Exit area
- **Yellow Cones**: NPC vision ranges
- **White Grid**: Store floor

## 🎪 How to Play Online

**Play Now**: [https://jinople.github.io/grok-flash-quest/](https://jinople.github.io/grok-flash-quest/)

## 🛠️ Technical Features

- Tile-based collision detection system
- Line-of-sight AI with raycasting
- Stealth mechanics with visibility states
- Progressive interaction system with timing constraints
- Escort AI with pathfinding delays
- Mobile-friendly touch controls

## 🎵 Audio

- Interactive sound effects for pickups, alerts, and interactions
- Toggle sound with the 🔊 button
- Web Audio API for retro-style sound generation

## 📱 Mobile Support

Touch controls automatically appear on mobile devices:
- D-pad for movement
- Interaction button for actions
- Responsive design for various screen sizes

## 🏆 Scoring

- **Item Collection**: 200 points each
- **Free Flash**: 500 points
- **Calm Flash**: 300 points
- **Time Bonus**: Faster completion = higher score
- **Stealth Bonus**: Fewer detections = better score

## 🔧 Configuration

Game mechanics can be tuned via the CONFIG object in `script.js`:
- Movement speeds
- Interaction durations
- Vision ranges and angles
- Stamina system parameters
- Timer limits

---

*Save Flash from his retail prison and become the hero Walmart never knew it needed!* 🐴✨
