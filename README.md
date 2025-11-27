# Iron Dome Command

A browser-based missile defense simulation game featuring sophisticated graphics, audio, and gameplay mechanics.

## 🎮 Play Now

**Live Game**: https://set2374.github.io/SET-App-Ceation/

## 📋 Project Overview

- **Name**: Iron Dome Command
- **Type**: HTML5 Canvas Game
- **Goal**: Defend cities from incoming missiles using various interceptor systems
- **Technology**: Pure HTML5, CSS3, and JavaScript (no frameworks required)

## 🎯 Game Features

### Interceptor Systems
- **Tamir**: Fast interceptors with small blast radius
- **Stunner**: Medium-speed interceptors with larger blast radius  
- **Arrow**: Slow interceptors with massive blast radius

### Enemy Missiles
- **Standard**: Basic missiles with moderate speed
- **Fast**: High-speed missiles requiring quick response
- **Heavy**: Slow but durable missiles with large blast radius
- **Cluster**: Missiles that split into multiple warheads when intercepted

### Gameplay Mechanics
- Progressive wave system with increasing difficulty
- Score bonuses for successful interceptions and city preservation
- Limited ammunition that replenishes between waves
- Real-time trajectory calculations and collision detection
- Particle effects and explosion animations
- Procedural audio system for sound effects

## 🚀 Deployment

### GitHub Repository
https://github.com/set2374/SET-App-Ceation

### Deployment Platform
GitHub Pages (deployed from `/docs` folder on `main` branch)

### Local Development
```bash
# Simply open the HTML file in any modern browser
open docs/index.html

# Or serve with any HTTP server
python3 -m http.server 8000
# Then visit http://localhost:8000/docs/
```

## 🏗️ Project Structure

```
webapp/
├── docs/
│   └── index.html          # Complete self-contained game
├── public/
│   └── index.html          # Source copy of game
├── src/
│   └── index.tsx           # Hono server (for future API features)
├── package.json
├── wrangler.jsonc          # Cloudflare configuration
└── README.md
```

## 🎨 Technical Implementation

### Graphics System
- HTML5 Canvas rendering with 60 FPS game loop
- Particle system with physics simulation
- Trail rendering for missiles and interceptors
- Gradient backgrounds with animated starfield
- City skylines with procedurally generated buildings

### Audio System
- Web Audio API for procedural sound generation
- Dynamic sound effects for launches, explosions, and impacts
- No external audio files required

### Game Architecture
- Modular entity system (missiles, interceptors, explosions, particles)
- Collision detection using spatial optimization
- State management for game phases (start, playing, wave complete, game over)
- Responsive design supporting desktop and mobile devices

## 📱 Device Support

- **Desktop**: Full keyboard and mouse controls
- **Mobile**: Touch-screen optimized interface
- **Tablet**: Responsive layout with adaptive UI

### Controls
- **Desktop**: 
  - Keys 1/2/3: Select interceptor type
  - Mouse: Aim and fire
- **Mobile/Tablet**: 
  - Tap interceptor buttons to select
  - Tap screen to fire

## 📊 Current Status

✅ **Fully Functional**  
✅ **Deployed to GitHub Pages**  
✅ **Repository Live on GitHub**  
✅ **Mobile and Desktop Optimized**

## 🔧 Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Graphics**: HTML5 Canvas API
- **Audio**: Web Audio API
- **Deployment**: GitHub Pages
- **Version Control**: Git/GitHub

## 📝 Development Notes

The game is entirely self-contained in a single HTML file with no external dependencies (except CDN-loaded fonts). This makes it:
- Easy to deploy anywhere
- Fast to load
- Simple to maintain
- Portable across platforms

## 🎯 Future Enhancements

Potential features for future versions:
- High score leaderboard
- Multiple difficulty levels
- Additional missile types
- Power-ups and special abilities
- Multiplayer mode
- Achievement system

## 📄 License

This project is deployed for demonstration purposes.

## 👤 Author

Stephen Turman  
Managing Partner, Turman Legal Solutions PLLC

---

**Last Updated**: 2025-11-27  
**Version**: 1.0.0  
**Status**: Production
