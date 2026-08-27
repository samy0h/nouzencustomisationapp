# PREMIUM CUSTOMIZATION WORKSPACE - QUICK TEST GUIDE

**Date:** 2026-08-27  
**Status:** ✅ READY FOR TESTING

---

## 🚀 IMMEDIATE TESTING

### 1. Open the Product Page

Navigate to: **http://localhost:5173/custom/product/tshirt-standard**

### 2. What You Should See

**TOP:**
- ← Retour au catalogue (back link)

**MAIN LAYOUT:**
- **Left:** Large preview workspace
  - [ Avant ] [ Arrière ] toggle buttons
  - Product image (black t-shirt front view)
  - Dashed rectangle (printable area)
  - Transparent canvas overlay
  - + Ajouter image | + Ajouter texte buttons

- **Right:** Configuration panel (4 cards)
  - Product info: "T-shirt standard personnalisé"
  - Color selector: 8 circular swatches
  - Size selector: XS S M L XL XXL buttons
  - Price card: "Prix unitaire 2200 DZD"

**BOTTOM:**
- Sticky action bar
  - "2200 DZD"
  - "T-shirt standard · Black"
  - [Au panier] [Commander] buttons

---

## ✅ INTERACTIVE TESTING

### Test 1: Color Selection
1. Click different color swatches
2. **Expected:** Product image changes to selected color
3. **Expected:** Selected swatch shows checkmark + ring

### Test 2: Size Selection
1. Click different size buttons
2. **Expected:** Selected button turns crimson with white text
3. **Expected:** "Commander" button enables

### Test 3: Front/Back Switching
1. Click **Arrière** button
2. **Expected:** Product image switches to back view
3. **Expected:** Button background changes to white

### Test 4: Image Upload
1. Click **+ Ajouter image**
2. Select an image file
3. **Expected:** Image appears on canvas
4. **Expected:** Can drag to move
5. **Expected:** Can resize with corner handles
6. **Expected:** Can rotate

### Test 5: Text Addition
1. Click **+ Ajouter texte**
2. **Expected:** "Votre texte" appears on canvas
3. **Expected:** Double-click to edit
4. **Expected:** Can drag to move
5. **Expected:** Can resize with corner handles

### Test 6: Bottom Action Bar
1. Scroll down the page
2. **Expected:** Bottom bar stays fixed at bottom
3. Click **Commander**
4. **Expected:** Navigates to customizer route

---

## 🌍 LANGUAGE TESTING

### Test French (DEFAULT)
- Page loads in French by default
- All buttons show French text

### Test English
1. Switch language to EN
2. **Expected:** All text changes to English
3. "Avant" → "Front"
4. "Arrière" → "Back"
5. "Ajouter image" → "Add image"

### Test Arabic (RTL)
1. Switch language to AR
2. **Expected:** Layout flips to RTL
3. **Expected:** Text in Arabic
4. **Expected:** Back arrow points right

---

## 🌓 THEME TESTING

### Test Light Mode (DEFAULT)
- Clean white backgrounds
- Clear shadows
- Crimson accents

### Test Dark Mode
1. Toggle dark mode
2. **Expected:** Dark backgrounds
3. **Expected:** White text
4. **Expected:** Adapted shadows
5. **Expected:** Crimson accent preserved

---

## 📱 RESPONSIVE TESTING

### Desktop (1400px+)
- Two columns side-by-side
- Large preview workspace
- Comfortable spacing

### Tablet (768px - 1024px)
- Single column layout
- Preview on top
- Config below

### Mobile (<768px)
- Vertical stack
- Full-width buttons
- Bottom bar stacks vertically
- Touch-optimized

---

## 🐛 KNOWN ISSUES / LIMITATIONS

### Current Limitations:
1. **Canvas size:** Fixed 400×500px (will adjust based on product)
2. **Printable area:** Hardcoded 280×350px (will be data-driven later)
3. **Design persistence:** Not saved between front/back switches yet
4. **Font selection:** Not implemented (text uses Arial)
5. **Color picker:** Not implemented (text is black)
6. **Layer management:** Not implemented
7. **Undo/redo:** Not implemented

These are intentionally left for future phases.

---

## ✅ VERIFICATION CHECKLIST

After testing, confirm:

- [ ] Page loads without errors
- [ ] No console errors (F12 → Console)
- [ ] All 6 product routes work
- [ ] Color selection changes image
- [ ] Size selection works
- [ ] Front/Back toggle works (T-shirt/Hoodie/Polo)
- [ ] Front/Back hidden (Cap/Tote Bag)
- [ ] Image upload works
- [ ] Uploaded image is movable
- [ ] Uploaded image is resizable
- [ ] Text addition works
- [ ] Text is editable
- [ ] Text is movable
- [ ] Bottom bar is sticky
- [ ] Bottom bar shows correct price
- [ ] Commander button navigates
- [ ] French is default
- [ ] English works
- [ ] Arabic works + RTL
- [ ] Dark mode works
- [ ] Light mode works
- [ ] Mobile responsive works
- [ ] No React Hook errors
- [ ] No TypeScript errors
- [ ] Build succeeds

---

## 🎯 TEST ALL PRODUCTS

Make sure to test every product route:

1. **/custom/product/tshirt-standard** ✓
   - Should show Front/Back toggle
   - 8 colors available
   - 5 sizes: S M L XL XXL

2. **/custom/product/tshirt-oversize** ✓
   - Should show Front/Back toggle
   - Colors from variants
   - Sizes from variants

3. **/custom/product/hoodie** ✓
   - Should show Front/Back toggle
   - Colors from variants
   - Sizes from variants

4. **/custom/product/polo** ✓
   - Should show Front/Back toggle
   - Colors from variants
   - Sizes from variants

5. **/custom/product/cap** ✓
   - Should NOT show Front/Back toggle
   - Colors from variants
   - Sizes from variants

6. **/custom/product/tote-bag** ✓
   - Should NOT show Front/Back toggle
   - Colors from variants
   - Sizes from variants

---

## 🎉 SUCCESS INDICATORS

The implementation is successful if:

✅ **Visual:** Page looks modern, premium, spacious
✅ **Functional:** All interactions work smoothly
✅ **Dynamic:** All products work (not just T-shirt)
✅ **Responsive:** Works on mobile/tablet/desktop
✅ **Accessible:** Keyboard navigation works
✅ **Performant:** No lag, smooth animations
✅ **Professional:** Feels like a design studio

---

## 📊 COMPARISON

**Before:** Basic e-commerce product page  
**After:** Premium product customization workspace

**Before:** Static image display  
**After:** Interactive canvas editor

**Before:** Generic controls  
**After:** Refined, modern UI

**Before:** Single action button  
**After:** Sticky action bar with dual actions

**Before:** Standard feel  
**After:** Professional studio feel

---

## 🚦 NEXT STEPS

### If Everything Works:
1. ✅ Mark implementation complete
2. ✅ Deploy to staging
3. ✅ Conduct user testing
4. ✅ Plan Phase 2 features

### If Issues Found:
1. Open browser console (F12)
2. Check for JavaScript errors
3. Check for React warnings
4. Share error messages
5. Debug and fix

---

**Test Status:** Ready for manual testing  
**Build Status:** ✅ SUCCESS  
**Dev Server:** ✅ RUNNING (http://localhost:5173)  
**Backend:** ✅ RUNNING (http://localhost:3001)  
**Database:** ✅ CONNECTED

**READY TO TEST! Open http://localhost:5173/custom/product/tshirt-standard**
