# Quick Test Guide - Responsive Design

## 🚀 Quick Start

1. **Open the app**:
   ```
   Open index.html in your browser
   ```

2. **Test Desktop** (> 1024px):
   - Sidebar visible on left
   - No hamburger menu
   - Select a lesson → plays immediately

3. **Test Mobile** (resize browser < 640px):
   - Sidebar hidden
   - Hamburger menu visible (top-left)
   - Click hamburger → sidebar slides in
   - Click overlay → sidebar closes
   - Select lesson → sidebar closes + lesson plays

---

## 📱 Browser DevTools Testing

### Chrome/Edge DevTools
1. Press `F12` or `Ctrl+Shift+I`
2. Click "Toggle device toolbar" icon (or `Ctrl+Shift+M`)
3. Select device:
   - **iPhone 12 Pro** (390×844) - Mobile Portrait
   - **iPad** (768×1024) - Tablet
   - **Responsive** - Custom size

### Test Scenarios

#### Scenario 1: Mobile Menu
1. Resize to 375×667 (iPhone SE)
2. ✅ Hamburger menu visible?
3. ✅ Sidebar hidden?
4. Click hamburger
5. ✅ Sidebar slides in from left?
6. ✅ Overlay appears?
7. Click overlay
8. ✅ Sidebar closes?

#### Scenario 2: Lesson Selection
1. Open mobile menu
2. Click any lesson
3. ✅ Lesson loads?
4. ✅ Menu closes automatically?
5. ✅ Audio player visible?
6. ✅ Content scrolls to top?

#### Scenario 3: Orientation Change
1. Set to iPhone 12 Pro (Portrait)
2. Open menu
3. Rotate to Landscape
4. ✅ Menu still works?
5. ✅ Layout adapts?
6. ✅ Controls accessible?

#### Scenario 4: Resize to Desktop
1. Start at 375px width (mobile)
2. Open menu
3. Slowly resize to 1200px
4. ✅ Menu closes automatically?
5. ✅ Sidebar becomes visible?
6. ✅ Hamburger menu disappears?

---

## 🎯 Touch Target Test

### Use Chrome DevTools
1. Open DevTools → Settings (F1)
2. Experiments → "Show touch target highlights"
3. Enable and reload
4. Check all interactive elements ≥ 44×44px

### Manual Check
Resize to mobile and check:
- [ ] Hamburger menu easy to tap
- [ ] Play/Pause buttons large enough
- [ ] Lesson items easy to select
- [ ] Checkboxes easy to check
- [ ] Volume slider easy to drag
- [ ] Progress bar easy to seek

---

## 🐛 Common Issues & Fixes

### Issue: Menu doesn't open
**Check**:
- Console for JavaScript errors
- `menuToggle` button exists
- Click event listener attached

### Issue: Sidebar doesn't slide
**Check**:
- CSS transition applied
- `.active` class added
- `transform: translateX(0)` working

### Issue: Overlay doesn't show
**Check**:
- `.sidebar-overlay` element exists
- Z-index correct (999)
- Opacity transition working

### Issue: Menu doesn't close on lesson select
**Check**:
- Click event on `.lesson-item`
- `closeMobileMenu()` called
- Timeout working (300ms)

---

## ✅ Final Checklist

### Desktop (> 1024px)
- [ ] Sidebar visible (320px width)
- [ ] No hamburger menu
- [ ] Two-column layout
- [ ] Hover effects work
- [ ] All features accessible

### Tablet (769px - 1024px)
- [ ] Sidebar visible (280px width)
- [ ] No hamburger menu
- [ ] Compact layout
- [ ] Touch-friendly controls

### Tablet Small (641px - 768px)
- [ ] Hamburger menu visible
- [ ] Sidebar hidden by default
- [ ] Menu slides in (300px width)
- [ ] Overlay works
- [ ] Auto-close on lesson select

### Mobile (< 640px)
- [ ] Hamburger menu visible
- [ ] Sidebar hidden by default
- [ ] Menu slides in (280px width)
- [ ] Overlay works
- [ ] Auto-close on lesson select
- [ ] Auto-scroll to content
- [ ] All buttons ≥ 44px

### Mobile Landscape (< 500px height)
- [ ] Compact header
- [ ] Sidebar works (260px width)
- [ ] All controls accessible
- [ ] No content overflow

### Interactions
- [ ] Tap hamburger → menu opens
- [ ] Tap overlay → menu closes
- [ ] Tap lesson → menu closes + loads
- [ ] Press ESC → menu closes
- [ ] Resize to desktop → menu closes
- [ ] Smooth animations (0.3s)

---

## 🎬 Video Test Sequence

1. **Start**: Desktop view (1920×1080)
   - Show sidebar visible
   - Select a lesson
   - Show it plays

2. **Resize**: To tablet (768px)
   - Show hamburger appears
   - Click to open menu
   - Show drawer slides in
   - Select lesson
   - Show auto-close

3. **Resize**: To mobile (375px)
   - Show compact layout
   - Open menu
   - Show overlay
   - Click overlay to close
   - Open menu again
   - Select lesson
   - Show auto-close + scroll

4. **Rotate**: To landscape
   - Show layout adapts
   - Menu still works
   - Controls accessible

5. **Resize**: Back to desktop
   - Show menu auto-closes
   - Sidebar becomes visible
   - Hamburger disappears

---

## 📊 Performance Check

### Animation Smoothness
- Open/close menu 10 times
- Should be smooth (60fps)
- No jank or lag

### Memory Usage
- Open DevTools → Performance
- Record while opening/closing menu
- Check for memory leaks

### Touch Response
- Tap hamburger 10 times quickly
- Should respond immediately
- No delayed reactions

---

## 🎉 Success Criteria

✅ **All tests pass**
✅ **Smooth animations**
✅ **Touch-friendly**
✅ **No console errors**
✅ **Works on all breakpoints**
✅ **Auto-close behaviors work**
✅ **Keyboard support (ESC)**
✅ **Responsive to resize**

---

## 📝 Report Template

```
Test Date: _______
Browser: _______
Device: _______

Desktop (> 1024px):     [ ] Pass  [ ] Fail
Tablet (769-1024px):    [ ] Pass  [ ] Fail
Tablet Small (641-768): [ ] Pass  [ ] Fail
Mobile (< 640px):       [ ] Pass  [ ] Fail
Landscape Mode:         [ ] Pass  [ ] Fail

Issues Found:
1. _______________________
2. _______________________
3. _______________________

Overall: [ ] Pass  [ ] Fail
```

---

**Ready to test? Open `index.html` and start resizing!** 🚀

