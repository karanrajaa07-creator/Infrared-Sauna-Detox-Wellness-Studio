/**
 * AURA & SOLACE - Pure Client-Side API & Data Store
 * Fully standalone, offline-ready mock engine with LocalStorage persistence.
 * Zero backend server required.
 */

// 1. LocalStorage Data Persistence Engine
const Store = {
  get(key, defaultValue = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn("Storage write error:", e);
    }
  },

  initSeeds() {
    // Services Seed
    if (!localStorage.getItem('wellness_services')) {
      this.set('wellness_services', [
        {
          id: 1,
          title: "Full-Spectrum Infrared Sauna",
          subtitle: "Solo Canadian Western Red Cedar Cabin",
          duration_min: 45,
          price: 65.00,
          category: "Infrared Sauna",
          description: "Deep core cellular sweat with medical grade near, mid, and far infrared wavelengths paired with chromotherapy and acoustic resonance sound."
        },
        {
          id: 2,
          title: "Clinical Red Light & Photobiomodulation",
          subtitle: "Medical-Grade High-Irradiance LED Suite",
          duration_min: 30,
          price: 55.00,
          category: "Photobiomodulation",
          description: "Targeted 660nm red and 850nm near-infrared photonic wavelengths for collagen stimulation, mitochondrial recharge, and deep muscle recovery."
        },
        {
          id: 3,
          title: "Contrast Therapy (Sauna + Cold Immersion)",
          subtitle: "Cedar Infrared Suite & 48°F Filtered Ice Tub",
          duration_min: 60,
          price: 85.00,
          category: "Contrast Therapy",
          description: "Vascular gymnastics pairing soothing 150°F dry infrared cedar warmth with invigorating cold immersion for dopamine enhancement and immune resilience."
        },
        {
          id: 4,
          title: "The Ultimate Detox Glow Ritual",
          subtitle: "45m Infrared + 30m Red Light + Organic Electrolytes",
          duration_min: 75,
          price: 120.00,
          category: "Signature Rituals",
          description: "Our marquee comprehensive cellular detox protocol paired with iced eucalyptus towel aromatherapy and mineral recovery elixirs."
        }
      ]);
    }

    // Membership Plans Seed
    if (!localStorage.getItem('wellness_membership_plans')) {
      this.set('wellness_membership_plans', [
        {
          id: 1,
          key: "detox-explorer",
          title: "Detox Explorer",
          price: 149.00,
          interval: "month",
          session_limit: 4,
          perks: [
            "4 full-spectrum infrared sessions per month",
            "10% discount on additional sessions & retail",
            "Unused sessions roll over for 30 days",
            "Complimentary herbal tea & towel service"
          ]
        },
        {
          id: 2,
          key: "vitality-signature",
          title: "Vitality Signature",
          price: 249.00,
          interval: "month",
          session_limit: 8,
          perks: [
            "8 full-spectrum infrared or red light sessions per month",
            "15% discount on guest passes and contrast sessions",
            "Complimentary Red Light upgrade with every visit",
            "Priority booking & flexible cancellation window"
          ]
        },
        {
          id: 3,
          key: "sanctuary-vip-unlimited",
          title: "Sanctuary Unlimited",
          price: 399.00,
          interval: "month",
          session_limit: 30,
          perks: [
            "Unlimited monthly infrared & photobiomodulation sessions",
            "Full access to Contrast Therapy cold plunge suite",
            "2 complimentary guest passes included each month",
            "Private dedicated cedar locker and bespoke robe"
          ]
        }
      ]);
    }

    // Registered Users Seed
    if (!localStorage.getItem('wellness_users')) {
      this.set('wellness_users', [
        {
          id: 1,
          full_name: "Emma Watson",
          email: "emma.watson@wellness.com",
          phone: "5552348901",
          password: "Client@12345",
          role: "client"
        },
        {
          id: 2,
          full_name: "Sarah Jenkins",
          email: "sarah@example.com",
          phone: "5551234567",
          password: "password123",
          role: "client"
        },
        {
          id: 3,
          full_name: "Elena Rostova (Director)",
          email: "admin@solacesauna.com",
          phone: "5559876543",
          password: "Admin@12345",
          role: "admin"
        },
        {
          id: 4,
          full_name: "Michael Sterling",
          email: "michael@example.com",
          phone: "5553456789",
          password: "password123",
          role: "client"
        }
      ]);
    }

    // Memberships Seed
    if (!localStorage.getItem('wellness_memberships')) {
      this.set('wellness_memberships', [
        {
          id: 1,
          user_id: 1,
          plan_name: "Vitality Signature",
          status: "active",
          session_limit: 8,
          sessions_used: 3,
          start_date: "2026-10-01",
          end_date: "2026-11-01"
        },
        {
          id: 2,
          user_id: 2,
          plan_name: "Detox Explorer",
          status: "active",
          session_limit: 4,
          sessions_used: 1,
          start_date: "2026-10-05",
          end_date: "2026-11-05"
        }
      ]);
    }

    // Bookings Seed
    if (!localStorage.getItem('wellness_bookings')) {
      this.set('wellness_bookings', [
        {
          id: 1,
          booking_code: "AUR-8921",
          user_id: 1,
          client_name: "Emma Watson",
          client_email: "emma.watson@wellness.com",
          client_phone: "5552348901",
          service_id: 1,
          service_title: "Full-Spectrum Infrared Sauna",
          duration_min: 45,
          booking_date: "2026-10-16",
          time_slot: "11:15 AM",
          status: "confirmed",
          price: 0.00,
          preparation_instructions: "Arrive 10 minutes prior for lounge check-in and complimentary hydration."
        },
        {
          id: 2,
          booking_code: "AUR-7740",
          user_id: 1,
          client_name: "Emma Watson",
          client_email: "emma.watson@wellness.com",
          client_phone: "5552348901",
          service_id: 2,
          service_title: "Clinical Red Light & Photobiomodulation",
          duration_min: 30,
          booking_date: "2026-10-20",
          time_slot: "02:00 PM",
          status: "confirmed",
          price: 0.00,
          preparation_instructions: "Ensure skin is clean and makeup-free for maximum photonic absorption."
        },
        {
          id: 3,
          booking_code: "AUR-5102",
          user_id: 1,
          client_name: "Emma Watson",
          client_email: "emma.watson@wellness.com",
          client_phone: "5552348901",
          service_id: 4,
          service_title: "The Ultimate Detox Glow Ritual",
          duration_min: 75,
          booking_date: "2026-10-08",
          time_slot: "10:00 AM",
          status: "completed",
          price: 120.00,
          preparation_instructions: ""
        },
        {
          id: 4,
          booking_code: "AUR-3419",
          user_id: 2,
          client_name: "Sarah Jenkins",
          client_email: "sarah@example.com",
          client_phone: "5551234567",
          service_id: 1,
          service_title: "Full-Spectrum Infrared Sauna",
          duration_min: 45,
          booking_date: "2026-10-15",
          time_slot: "09:00 AM",
          status: "confirmed",
          price: 0.00,
          preparation_instructions: ""
        },
        {
          id: 5,
          booking_code: "AUR-9011",
          user_id: 4,
          client_name: "Michael Sterling",
          client_email: "michael@example.com",
          client_phone: "5553456789",
          service_id: 3,
          service_title: "Contrast Therapy (Sauna + Cold Immersion)",
          duration_min: 60,
          booking_date: "2026-10-14",
          time_slot: "03:15 PM",
          status: "confirmed",
          price: 85.00,
          preparation_instructions: ""
        }
      ]);
    }

    // Wellness Goals Seed
    if (!localStorage.getItem('wellness_goals')) {
      this.set('wellness_goals', {
        primary_goal: "cellular_detox",
        target_sessions_per_week: 3,
        preferred_temp: "Medium (55°C)",
        music_preference: "Solfeggio 528Hz Healing Tones",
        notes: "Support nervous system recovery and improve deep sleep architecture."
      });
    }

    // Notifications Seed
    if (!localStorage.getItem('wellness_notifications')) {
      this.set('wellness_notifications', [
        {
          id: 1,
          user_id: 1,
          title: "Session Confirmed",
          message: "Your upcoming Full-Spectrum Infrared Sauna session is booked for Oct 16 at 11:15 AM.",
          is_read: false,
          created_at: "Today at 9:00 AM"
        },
        {
          id: 2,
          user_id: 1,
          title: "Hydration Guidance",
          message: "Drink at least 500ml of mineralized water 1 hour prior to your thermal sweat.",
          is_read: true,
          created_at: "Yesterday"
        },
        {
          id: 3,
          user_id: 1,
          title: "Membership Benefits Active",
          message: "Your Vitality Signature tier has 5 sessions remaining this monthly cycle.",
          is_read: true,
          created_at: "Oct 1, 2026"
        }
      ]);
    }

    // Contact Inquiries Seed
    if (!localStorage.getItem('wellness_inquiries')) {
      this.set('wellness_inquiries', [
        {
          id: 1,
          name: "Marcus Aurelius",
          email: "marcus@example.com",
          phone: "5558821920",
          service: "Sauna and Red Light Synergy",
          subject: "Corporate Wellness Afternoon",
          message: "We have a group of 6 colleagues interested in booking private cedar suites this coming Friday.",
          created_at: "Oct 12, 2026"
        }
      ]);
    }

    // Blocked Slots Seed
    if (!localStorage.getItem('wellness_blocked_slots')) {
      this.set('wellness_blocked_slots', [
        {
          id: 1,
          slot_date: "2026-10-25",
          time_slot: "07:00 PM",
          reason: "Deep Cedar Sanitization & Lamp Recalibration"
        }
      ]);
    }

    // Blog & Journal Articles Seed
    if (!localStorage.getItem('wellness_blog_articles')) {
      this.set('wellness_blog_articles', [
        {
          id: 1,
          slug: "far-infrared-cellular-detox-heavy-metal-release",
          title: "The Deep Science of Far-Infrared Sweat: Cellular Detoxification & Heavy Metal Release",
          subtitle: "Why 55°C resonant radiant warmth mobilizes environmental toxicants without the stifling air of traditional steam rooms.",
          category: "Infrared Science",
          read_time: "6 min read",
          date: "October 14, 2026",
          author: "Dr. Elena Vance, ND",
          author_role: "Naturopathic Doctor & Thermal Specialist",
          author_avatar: "images/practitioner-1.jpg",
          image: "images/blog-infrared-science.jpg",
          summary: "Discover the biological mechanisms that differentiate radiant far-infrared sweating from ambient steam rooms, including heat shock protein stimulation (HSP70) and sweat-mediated elimination of cadmium, lead, and BPA.",
          featured: true,
          tags: ["Cellular Detox", "Far-Infrared", "Heat Shock Proteins", "Longevity"],
          content: `
            <p class="lead text-secondary mb-4">
              For generations, traditional steam saunas have operated on convective heat transfer: baking ambient air to blistering temperatures between 80°C and 95°C (175°F–200°F). While effective for surface heating, the oppressive air density often drives bathers out long before deep core benefits can manifest.
            </p>

            <h3 id="physics-radiant-heat" class="h4 fw-bold mt-5 mb-3 text-dark">1. The Physics of Radiant Heat vs. Ambient Steam</h3>
            <p>
              Infrared energy is not heat in the conventional air-warming sense; it is an invisible spectrum of light that converts to radiant thermal energy when absorbed by biological water molecules. Human tissue is predominantly composed of water, which possesses an optical resonance window that directly matches far-infrared light waves (peaking between 7 and 14 micrometers).
            </p>
            <p>
              Because the ambient air remains at a gentle, deeply breathable 45°C–55°C, your respiratory tract is not stressed. Meanwhile, radiant photons penetrate 1.5 to 2 inches into subdermal fat deposits, skeletal muscle, and connective tissue, warming you from the inside out.
            </p>

            <blockquote class="aura-pull-quote my-4 p-4 border-start border-4 border-warning bg-light rounded-end">
              <p class="fst-italic mb-2 text-dark fs-5">
                "Far-infrared thermal conditioning triggers an acoustic vibrational response in intracellular water, gently facilitating the clearance of metabolic waste while conserving vital electrolyte balance."
              </p>
              <cite class="small text-muted fw-semibold">— Clinical Journal of Environmental & Public Health</cite>
            </blockquote>

            <h3 id="mobilizing-toxins" class="h4 fw-bold mt-5 mb-3 text-dark">2. Mobilizing Cellular Toxins & Cutaneous Sweat</h3>
            <p>
              While the liver and kidneys remain your body's primary filtration organs, cutaneous perspiration serves as a vital tertiary pathway for fat-soluble xenobiotics. Clinical trials analyzing perspiration induced by far-infrared saunas found higher concentrations of environmental toxicants compared to standard urine or plasma samples:
            </p>
            <ul class="d-flex flex-column gap-2 mb-4">
              <li><strong>Heavy Metals:</strong> Cutaneous excretion of cadmium, lead, mercury, and nickel without overburdening renal filtration pathways.</li>
              <li><strong>Endocrine Disruptors:</strong> Trace releases of Bisphenol-A (BPA), phthalate plasticizers, and flame-retardant organophosphates sequestered in subcutaneous adipose tissue.</li>
              <li><strong>Lactic Acid & Uric Byproducts:</strong> Accelerated flushing of post-exercise metabolic debris, dramatically curtailing delayed onset muscle soreness (DOMS).</li>
            </ul>

            <div class="my-4 p-4 rounded-4 bg-white border shadow-sm">
              <h5 class="fw-bold mb-3 text-dark"><i class="bi bi-bar-chart-line text-warning me-2"></i>Comparative Sweat Composition Analysis</h5>
              <div class="table-responsive">
                <table class="table table-sm align-middle mb-0">
                  <thead class="table-light">
                    <tr>
                      <th>Factor</th>
                      <th>Traditional Steam Sauna (90°C)</th>
                      <th>Full-Spectrum Infrared (55°C)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td class="fw-semibold">Sweat Water Ratio</td>
                      <td>~97% Pure Water, 3% Salt</td>
                      <td>~80-85% Water, 15-20% Organic Debris</td>
                    </tr>
                    <tr>
                      <td class="fw-semibold">Core Heat Penetration</td>
                      <td>Superficial epidermis (1-2mm)</td>
                      <td>Deep subdermal & muscle (35-50mm)</td>
                    </tr>
                    <tr>
                      <td class="fw-semibold">Tolerable Duration</td>
                      <td>12 to 15 minutes max</td>
                      <td>35 to 45 minutes calm immersion</td>
                    </tr>
                    <tr>
                      <td class="fw-semibold">Cardiovascular Strain</td>
                      <td>Elevated pulse via air stifling</td>
                      <td>Gentle aerobic mimetic response</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <h3 id="heat-shock-proteins" class="h4 fw-bold mt-5 mb-3 text-dark">3. Cardiovascular Conditioning & Heat Shock Proteins (HSP70)</h3>
            <p>
              One of the most remarkable longevity adaptations observed in regular thermal bathers is the rapid upregulation of <em>Heat Shock Protein 70 (HSP70)</em>. These chaperone molecules detect misfolded protein strands within aging cells, stabilizing their tertiary geometry and directing unrepairable cellular debris to lysosomes for autophagy.
            </p>
            <p>
              Furthermore, as radiant warmth triggers peripheral vasodilation, stroke volume rises while total peripheral resistance declines. This creates a gentle, passive cardiovascular conditioning effect equivalent to a brisk incline walk, helping support blood pressure regulation and arterial compliance.
            </p>

            <h3 id="ideal-protocol" class="h4 fw-bold mt-5 mb-3 text-dark">4. The Recommended 45-Minute Infrared Sweat Protocol</h3>
            <p>To maximize cellular detoxification without fatigue, our clinical practitioners recommend the following cadence:</p>
            <ol class="d-flex flex-column gap-2 mb-4 ps-3">
              <li><strong>Pre-Hydration (T-minus 30 min):</strong> Consume 500ml of room-temperature spring water fortified with organic sea salt or bioavailable magnesium and potassium.</li>
              <li><strong>The First 15 Minutes:</strong> Ease into the cabin set between 48°C and 52°C. Skin will warm gently as peripheral capillaries open.</li>
              <li><strong>The Active Sweat Phase (Minutes 15-40):</strong> Core temperature gently elevates by 1.2°C to 1.8°C. Profuse, non-stinging perspiration begins.</li>
              <li><strong>Cool-Down Transition (Minutes 40-45):</strong> Disembark calmly, wrap in an organic waffle towel, and sip chilled eucalyptus-infused water to allow your autonomic tone to recalibrate.</li>
            </ol>

            <h3 id="safety-notes" class="h4 fw-bold mt-5 mb-3 text-dark">5. Clinical Safety & Medical Considerations</h3>
            <p class="text-secondary">
              Infrared therapy is exceptionally gentle and well-tolerated by healthy adults. However, individuals with implanted silicone devices, pacemaker units, unmanaged hypertension, or those who are currently pregnant should always speak with their personal physician prior to beginning any regular thermal therapy regime.
            </p>
          `
        },
        {
          id: 2,
          slug: "contrast-therapy-fire-and-ice-protocol",
          title: "Contrast Therapy (Fire & Ice): Why Pairing 150°F Heat with 48°F Cold Immersion Upgrades Your Biology",
          subtitle: "A neuro-vascular masterclass in elevating dopamine by 250%, flushing lactic acid, and toning the vagus nerve.",
          category: "Contrast Therapy",
          read_time: "7 min read",
          date: "October 10, 2026",
          author: "Marcus Thorne, MS, CSCS",
          author_role: "Exercise Physiologist & Contrast Protocol Director",
          author_avatar: "images/practitioner-2.jpg",
          image: "images/blog-contrast-routine.jpg",
          summary: "Step inside the physiology of vascular pumping. Alternating between infrared vasodilation and cold immersion vasoconstriction triggers profound neurochemical and anti-inflammatory cascades.",
          featured: false,
          tags: ["Cold Plunge", "Dopamine", "Vagus Nerve", "Recovery"],
          content: `
            <p class="lead text-secondary mb-4">
              Contrast therapy—the intentional alternating cycle between high radiant heat and sub-50°F cold water immersion—is the gold standard bio-hack for athletic recovery, mental grit, and vascular vitality.
            </p>
            <h3 class="h4 fw-bold mt-4 mb-3 text-dark">The Vascular Gymnastics Mechanism</h3>
            <p>
              When your body is exposed to 140°F–150°F infrared warmth, your peripheral vascular network dilates dramatically to dissipate heat, driving oxygenated blood deep into skeletal muscles. Stepping immediately into a 48°F filtered ice tub triggers instant vasoconstriction, shunting blood rapidly toward vital core organs.
            </p>
            <p>
              This rhythmic alternating contraction and expansion functions like a biological pump, flushing lymphatic fluids, reducing interstitial edema, and expelling stagnant cellular metabolites.
            </p>
            <blockquote class="aura-pull-quote my-4 p-4 border-start border-4 border-info bg-light rounded-end">
              <p class="fst-italic mb-2 text-dark fs-5">
                "Cold immersion stimulates an immediate 250% increase in circulating dopamine and a 500% rise in norepinephrine that remains elevated for up to 3 hours without the sudden crash associated with stimulants."
              </p>
              <cite class="small text-muted fw-semibold">— European Journal of Applied Physiology</cite>
            </blockquote>
            <h3 class="h4 fw-bold mt-4 mb-3 text-dark">The Optimal 3:1 Sanctuary Protocol</h3>
            <p>For sustainable cognitive resilience and joint health, we recommend:</p>
            <ul>
              <li><strong>Round 1:</strong> 15 minutes in the Canadian Cedar Infrared Suite (145°F).</li>
              <li><strong>Cold Step 1:</strong> 2 to 3 minutes in our 48°F ozone-filtered plunge, focusing on slow diaphragmatic exhales.</li>
              <li><strong>Round 2:</strong> 15 minutes of re-warming heat with warm amber chromotherapy.</li>
              <li><strong>Cold Step 2:</strong> 2 minutes final immersion. Always end on cold for maximal metabolic stimulation, or end on warmth if seeking immediate evening sedation.</li>
            </ul>
          `
        },
        {
          id: 3,
          slug: "photobiomodulation-red-light-mitochondrial-recharge",
          title: "Photobiomodulation 101: How 660nm Red & 850nm Near-Infrared Light Recharges Cellular Mitochondria",
          subtitle: "The non-invasive light therapy clinically documented to stimulate ATP synthesis, accelerate collagen cross-linking, and reduce cellular senescence.",
          category: "Photobiomodulation",
          read_time: "5 min read",
          date: "October 04, 2026",
          author: "Dr. Elena Vance, ND",
          author_role: "Naturopathic Doctor & Thermal Specialist",
          author_avatar: "images/practitioner-1.jpg",
          image: "images/blog-redlight-glow.jpg",
          summary: "Unlocking cellular vitality through targeted photon absorption. How red light frees cytochrome c oxidase from nitric oxide to supercharge your cellular energy factories.",
          featured: false,
          tags: ["Red Light", "ATP Synthesis", "Collagen", "Anti-Aging"],
          content: `
            <p class="lead text-secondary mb-4">
              Light is an essential biological nutrient. Just as plants transform photons into chemical sugars through photosynthesis, human cells absorb red and near-infrared light to generate adenosine triphosphate (ATP)—the universal energy currency of cellular life.
            </p>
            <h3 class="h4 fw-bold mt-4 mb-3 text-dark">Targeting Cytochrome C Oxidase</h3>
            <p>
              Inside your cells' mitochondria lies a photoreceptive enzyme named <em>cytochrome c oxidase</em>. Under conditions of oxidative stress or fatigue, nitric oxide (NO) binds to this enzyme, halting cellular respiration.
            </p>
            <p>
              When irradiated with clinical wavelengths of 660nm (visible red) and 850nm (near-infrared), photons dislodge inhibitory nitric oxide molecules, allowing oxygen to bind freely. The result is a surge in cellular ATP generation, reduced oxidative stress, and rapid tissue rejuvenation.
            </p>
            <h3 class="h4 fw-bold mt-4 mb-3 text-dark">Skin Tone, Elasticity, & Joint Relief</h3>
            <p>
              Dermal fibroblasts are especially receptive to 660nm wavelengths. Regular 20-minute sessions stimulate natural pro-collagen type 1 synthesis, smoothing fine lines, improving tone, and restoring youthful skin hydration without any UV risk or photo-thermal damage.
            </p>
          `
        },
        {
          id: 4,
          slug: "evening-infrared-sleep-architecture-restoration",
          title: "Optimizing Sleep Architecture: Why an Evening Infrared Session Deepens Slow-Wave Sleep",
          subtitle: "How triggering a post-heat thermoregulatory core body drop accelerates sleep onset and optimizes delta wave cycles.",
          category: "Sleep & Recovery",
          read_time: "5 min read",
          date: "September 28, 2026",
          author: "Aria Sterling",
          author_role: "Somnologist & Sanctuary Breathwork Guide",
          author_avatar: "images/practitioner-3.jpg",
          image: "images/blog-circadian-sleep.jpg",
          summary: "If you struggle with waking up unrefreshed, learn how strategic evening thermal exposure shifts your autonomic nervous system from sympathetic fight-or-flight into restorative parasympathetic bliss.",
          featured: false,
          tags: ["Deep Sleep", "Circadian Rhythm", "Melatonin", "Vagus Nerve"],
          content: `
            <p class="lead text-secondary mb-4">
              Human sleep architecture is inextricably governed by internal circadian thermoregulation. To initiate slow-wave deep sleep, your core body temperature must decrease by approximately 1°C (2°F).
            </p>
            <h3 class="h4 fw-bold mt-4 mb-3 text-dark">The Thermoregulatory Paradox</h3>
            <p>
              Immersing yourself in an infrared sauna 90 to 120 minutes prior to bedtime temporarily elevates core temperature. However, upon exiting the suite, your body's vasodilated peripheral blood vessels rapidly release radiant heat into the ambient air.
            </p>
            <p>
              This steep, post-session drop in internal core temperature acts as a potent biological signal to the hypothalamus, triggering natural melatonin secretion and inducing drowsiness with remarkable consistency.
            </p>
            <h3 class="h4 fw-bold mt-4 mb-3 text-dark">Nervous System Tone Downshift</h3>
            <p>
              Combined with Solfeggio sound resonance and soothing amber chromotherapy, evening thermal sessions lower sympathetic nervous drive, decrease resting heart rate variability stress scores, and lengthen uninterrupted stage 3 and 4 restorative delta-wave sleep.
            </p>
          `
        },
        {
          id: 5,
          slug: "pre-post-sauna-hydration-electrolytes-guide",
          title: "The Ultimate Pre- and Post-Sauna Hydration Protocol: Beyond Plain Water",
          subtitle: "Why chugging cold tap water can disrupt cellular osmolarity, and how potassium, magnesium, and sodium restore thermal balance.",
          category: "Holistic Nutrition",
          read_time: "4 min read",
          date: "September 19, 2026",
          author: "Marcus Thorne, MS, CSCS",
          author_role: "Exercise Physiologist & Contrast Protocol Director",
          author_avatar: "images/practitioner-2.jpg",
          image: "images/studio-lounge.jpg",
          summary: "A practical guide to cellular hydration before entering the cabin and mineral replenishment protocols to sustain your post-sauna euphoria throughout the day.",
          featured: false,
          tags: ["Hydration", "Electrolytes", "Mineralization", "Cellular Health"],
          content: `
            <p class="lead text-secondary mb-4">
              During a comprehensive 45-minute full-spectrum infrared sweat session, a regular bather can shed between 500ml and 1000ml of fluid. While rehydration is essential, simply gulping liters of distilled or plain tap water can dilute plasma sodium levels, leaving you with lightheadedness or fatigue.
            </p>
            <h3 class="h4 fw-bold mt-4 mb-3 text-dark">The Golden Electrolyte Ratio</h3>
            <p>
              To replenish what was lost in the cabin, focus on mineral osmolarity. We recommend pairing filtered water with:
            </p>
            <ul>
              <li><strong>Bioavailable Sodium (300-500mg):</strong> Unrefined Celtic sea salt or Himalayan pink salt crystals to maintain extracellular fluid pressure.</li>
              <li><strong>Potassium Citrate (200mg):</strong> Encourages fluid transfer back into dehydrated intracellular compartments.</li>
              <li><strong>Magnesium Glycinate or Malate (150mg):</strong> Supports neuromuscular relaxation and prevents post-sweat cramping.</li>
            </ul>
            <p>
              At Aura & Solace, our relaxation lounge provides complimentary organic coconut water infusions and mineral elixirs to ensure your post-sanctuary recovery is complete.
            </p>
          `
        },
        {
          id: 6,
          slug: "sensory-solitude-mental-sanctuary-cedar-suites",
          title: "Sensory Solitude in a Hyper-Connected World: The Mental Sanctuary of Cedar Suites",
          subtitle: "How 45 minutes of acoustic resonance, zero digital notifications, and warm chromotherapy resets cognitive fatigue.",
          category: "Mindfulness",
          read_time: "4 min read",
          date: "September 12, 2026",
          author: "Aria Sterling",
          author_role: "Somnologist & Sanctuary Breathwork Guide",
          author_avatar: "images/practitioner-3.jpg",
          image: "images/home2-vip-suite.jpg",
          summary: "Modern sensory overload keeps our adrenal systems on constant high alert. Here is how private sensory suites create the neurological space needed for mental restoration.",
          featured: false,
          tags: ["Digital Detox", "Mindfulness", "Sensory Deprivation", "Acoustic Resonance"],
          content: `
            <p class="lead text-secondary mb-4">
              Between constant push notifications, relentless blue-lit screens, and urban auditory pollution, the modern human brain rarely experiences genuine quietude. This chronic low-grade sensory bombardment keeps our amygdala and sympathetic nervous systems in sustained hyper-arousal.
            </p>
            <h3 class="h4 fw-bold mt-4 mb-3 text-dark">A Sanctuary Away from Signals</h3>
            <p>
              Our cedar suites are deliberately designed as low-EMF sanctuaries. With your phone securely stowed in your private suite's felt pouch, the brain is liberated from dopamine-seeking notification loops.
            </p>
            <p>
              The gentle natural scent of Canadian cedar wood terpenes (which have been clinically shown to reduce cortisol), combined with harmonic acoustic vibration underneath the cedar bench, guides your brainwaves from beta alertness into deep alpha and theta meditative tranquility.
            </p>
          `
        }
      ]);
    }

    // Blog Comments Seed
    if (!localStorage.getItem('wellness_blog_comments')) {
      this.set('wellness_blog_comments', [
        {
          id: 101,
          article_id: 1,
          author_name: "Camilla Rodriguez",
          author_email: "camilla@example.com",
          message: "The explanation regarding radiant heat versus ambient steam completely made sense to me! I could never last more than 10 minutes in a standard gym sauna, but in your cedar infrared suite I stayed for 40 minutes in absolute peaceful comfort.",
          created_at: "Oct 15, 2026 at 3:45 PM",
          avatar_initials: "CR"
        },
        {
          id: 102,
          article_id: 1,
          author_name: "Dr. David Chen",
          author_email: "david.chen@medical.org",
          message: "Appreciate the scientific honesty here. So many spas make outlandish detox claims; it is refreshing to see you cite peer-reviewed literature regarding HSP70 and cutaneous metal excretion with clinical modesty.",
          created_at: "Oct 16, 2026 at 10:12 AM",
          avatar_initials: "DC"
        },
        {
          id: 103,
          article_id: 2,
          author_name: "Liam O'Connor",
          author_email: "liam@athletic.com",
          message: "The 3:1 contrast protocol has been a game-changer for my post-triathlon recovery. That dopamine spike after the 48°F plunge is very real and lasts all afternoon!",
          created_at: "Oct 12, 2026 at 1:20 PM",
          avatar_initials: "LO"
        }
      ]);
    }
  }
};

// Initialize seeds immediately
Store.initSeeds();

// 2. High-Level Mock API Interface (100% Client-Side)
const API = {
  // Session helpers
  getToken() {
    return localStorage.getItem('wellness_token') || sessionStorage.getItem('wellness_token');
  },

  getUser() {
    const raw = localStorage.getItem('wellness_user') || sessionStorage.getItem('wellness_user');
    try { return raw ? JSON.parse(raw) : null; } catch(e) { return null; }
  },

  // Auth Operations
  async login(email, password, rememberMe = true) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const users = Store.get('wellness_users', []);
    
    // Find matching user or allow flexible password for testing
    let matchedUser = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!matchedUser) {
      // If user doesn't exist, create client user on the fly for effortless testing
      matchedUser = {
        id: Date.now(),
        full_name: cleanEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        email: cleanEmail,
        phone: '5552348901',
        password: password,
        role: cleanEmail.includes('admin') ? 'admin' : 'client'
      };
      users.push(matchedUser);
      Store.set('wellness_users', users);
    } else {
      // Validate password if user exists
      if (matchedUser.password && password && matchedUser.password !== password) {
        // Allow demo accounts easy entry if someone types generic password
        const isDemo = cleanEmail === 'emma.watson@wellness.com' || cleanEmail === 'admin@solacesauna.com' || cleanEmail === 'sarah@example.com';
        if (!isDemo && password.length < 4) {
          const err = new Error("Invalid password. Please check your credentials.");
          err.status = 401;
          throw err;
        }
      }
    }

    const token = 'aura_token_' + Math.random().toString(36).substring(2) + Date.now();
    const userData = {
      id: matchedUser.id,
      full_name: matchedUser.full_name,
      email: matchedUser.email,
      phone: matchedUser.phone || '',
      role: matchedUser.role || 'client'
    };

    if (rememberMe) {
      localStorage.setItem('wellness_token', token);
      localStorage.setItem('wellness_user', JSON.stringify(userData));
      sessionStorage.removeItem('wellness_token');
      sessionStorage.removeItem('wellness_user');
    } else {
      sessionStorage.setItem('wellness_token', token);
      sessionStorage.setItem('wellness_user', JSON.stringify(userData));
      localStorage.removeItem('wellness_token');
      localStorage.removeItem('wellness_user');
    }

    return {
      success: true,
      token: token,
      user: userData,
      message: `Welcome back to Solace Sanctuary, ${userData.full_name}!`
    };
  },

  async register(fullName, email, password, phone = '') {
    const cleanEmail = (email || '').trim().toLowerCase();
    const users = Store.get('wellness_users', []);

    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      const err = new Error("An account with this email already exists. Please log in.");
      err.status = 400;
      throw err;
    }

    const newUser = {
      id: Date.now(),
      full_name: fullName.trim(),
      email: cleanEmail,
      password: password,
      phone: phone.trim(),
      role: 'client'
    };
    users.push(newUser);
    Store.set('wellness_users', users);

    // Auto assign starter membership
    const memberships = Store.get('wellness_memberships', []);
    memberships.push({
      id: Date.now(),
      user_id: newUser.id,
      plan_name: "Detox Explorer",
      status: "active",
      session_limit: 4,
      sessions_used: 0,
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
    });
    Store.set('wellness_memberships', memberships);

    const token = 'aura_token_' + Math.random().toString(36).substring(2);
    const userData = {
      id: newUser.id,
      full_name: newUser.full_name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role
    };

    localStorage.setItem('wellness_token', token);
    localStorage.setItem('wellness_user', JSON.stringify(userData));

    return {
      success: true,
      token: token,
      user: userData,
      message: "Account created successfully! Welcome to Aura & Solace."
    };
  },

  async logout() {
    localStorage.removeItem('wellness_token');
    localStorage.removeItem('wellness_user');
    sessionStorage.removeItem('wellness_token');
    sessionStorage.removeItem('wellness_user');
    window.location.href = 'login.html';
  },

  async getMe() {
    const user = this.getUser();
    if (!user) {
      return { authenticated: false, user: null, membership: null };
    }

    const memberships = Store.get('wellness_memberships', []);
    const userMem = memberships.find(m => m.user_id === user.id && m.status === 'active') || memberships[0] || null;

    return {
      authenticated: true,
      user: user,
      membership: userMem
    };
  },

  async forgotPassword(email) {
    return {
      success: true,
      message: "Verification code sent! For this demo, your code is 123456."
    };
  },

  async resetPassword(email, newPassword, resetCode = '123456') {
    const cleanEmail = (email || '').trim().toLowerCase();
    const users = Store.get('wellness_users', []);
    const user = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (user) {
      user.password = newPassword;
      Store.set('wellness_users', users);
    }
    return {
      success: true,
      message: "Password updated successfully. Please sign in with your new credentials."
    };
  },

  // Services
  async getServices() {
    return {
      services: Store.get('wellness_services', [])
    };
  },

  async getService(id) {
    const services = Store.get('wellness_services', []);
    const srv = services.find(s => s.id === parseInt(id));
    if (!srv) throw new Error("Service not found");
    return srv;
  },

  // Slot Availability & Bookings
  async getAvailability(date, serviceId) {
    const allSlots = [
      "09:00 AM", "10:00 AM", "11:15 AM", "12:30 PM", 
      "02:00 PM", "03:15 PM", "04:30 PM", "05:45 PM", "07:00 PM"
    ];

    const bookings = Store.get('wellness_bookings', []);
    const blockedSlots = Store.get('wellness_blocked_slots', []);

    const slots = allSlots.map(time => {
      // Check if slot is blocked by admin
      const isBlocked = blockedSlots.some(b => b.slot_date === date && b.time_slot === time);
      if (isBlocked) {
        return { time, available: false, reason: "Reserved" };
      }

      // Check if booked
      const isBooked = bookings.some(b => 
        b.booking_date === date && 
        b.time_slot === time && 
        (b.status === 'confirmed' || b.status === 'rescheduled')
      );

      if (isBooked) {
        return { time, available: false, reason: "Booked" };
      }

      return { time, available: true, reason: "" };
    });

    return { date, slots };
  },

  async createBooking(bookingData) {
    const bookings = Store.get('wellness_bookings', []);
    const services = Store.get('wellness_services', []);
    const currentUser = this.getUser();

    const service = services.find(s => s.id === parseInt(bookingData.service_id)) || services[0];
    const memberships = Store.get('wellness_memberships', []);
    let userMem = currentUser ? memberships.find(m => m.user_id === currentUser.id && m.status === 'active') : null;

    let isCoveredByMembership = false;
    let finalPrice = service.price;

    if (userMem && userMem.sessions_used < userMem.session_limit) {
      userMem.sessions_used += 1;
      Store.set('wellness_memberships', memberships);
      isCoveredByMembership = true;
      finalPrice = 0.00;
    }

    const randomRef = 'AUR-' + Math.floor(1000 + Math.random() * 9000);
    const newBooking = {
      id: Date.now(),
      booking_code: randomRef,
      user_id: currentUser ? currentUser.id : null,
      client_name: bookingData.client_name,
      client_email: bookingData.client_email,
      client_phone: bookingData.client_phone,
      service_id: service.id,
      service_title: service.title,
      duration_min: service.duration_min,
      booking_date: bookingData.booking_date,
      time_slot: bookingData.time_slot,
      status: 'confirmed',
      price: finalPrice,
      notes: bookingData.notes || '',
      preparation_instructions: "Arrive 10 minutes prior for hydration and cedar suite orientation."
    };

    bookings.unshift(newBooking);
    Store.set('wellness_bookings', bookings);

    // Add confirmation notification
    const notifications = Store.get('wellness_notifications', []);
    notifications.unshift({
      id: Date.now(),
      user_id: currentUser ? currentUser.id : 1,
      title: "Booking Confirmed",
      message: `Your appointment for ${service.title} on ${bookingData.booking_date} at ${bookingData.time_slot} is confirmed (Ref: ${randomRef}).`,
      is_read: false,
      created_at: "Just now"
    });
    Store.set('wellness_notifications', notifications);

    return {
      success: true,
      booking: newBooking,
      message: "Appointment confirmed successfully."
    };
  },

  async getMyBookings() {
    const currentUser = this.getUser();
    const bookings = Store.get('wellness_bookings', []);

    if (!currentUser) {
      return { bookings: bookings.slice(0, 3) };
    }

    // Match by user_id or by email
    const myBookings = bookings.filter(b => 
      b.user_id === currentUser.id || 
      (b.client_email && b.client_email.toLowerCase() === currentUser.email.toLowerCase())
    );

    // If empty for this user, fallback to demo bookings so user has a rich UI experience
    return {
      bookings: myBookings.length > 0 ? myBookings : bookings.slice(0, 3)
    };
  },

  async rescheduleBooking(bookingId, newDate, newTimeSlot) {
    const bookings = Store.get('wellness_bookings', []);
    const b = bookings.find(item => item.id === parseInt(bookingId));
    if (!b) throw new Error("Appointment not found");

    b.booking_date = newDate;
    b.time_slot = newTimeSlot;
    b.status = 'rescheduled';
    Store.set('wellness_bookings', bookings);

    return {
      success: true,
      booking: b,
      message: "Appointment successfully rescheduled."
    };
  },

  async cancelBooking(bookingId) {
    const bookings = Store.get('wellness_bookings', []);
    const b = bookings.find(item => item.id === parseInt(bookingId));
    if (!b) throw new Error("Appointment not found");

    b.status = 'cancelled';
    Store.set('wellness_bookings', bookings);

    return {
      success: true,
      message: "Appointment cancelled."
    };
  },

  async getBookingByCode(code) {
    const bookings = Store.get('wellness_bookings', []);
    const b = bookings.find(item => item.booking_code.toUpperCase() === (code || '').trim().toUpperCase());
    if (!b) throw new Error("Booking code not found");
    return { booking: b };
  },

  // Memberships
  async getMembershipPlans() {
    return {
      plans: Store.get('wellness_membership_plans', [])
    };
  },

  async getMyMemberships() {
    const currentUser = this.getUser();
    const memberships = Store.get('wellness_memberships', []);
    if (!currentUser) return { memberships: memberships.slice(0, 1) };

    const my = memberships.filter(m => m.user_id === currentUser.id);
    return {
      memberships: my.length > 0 ? my : memberships.slice(0, 1)
    };
  },

  async purchaseMembership(planId) {
    const plans = Store.get('wellness_membership_plans', []);
    const plan = plans.find(p => p.id === parseInt(planId)) || plans[0];
    const currentUser = this.getUser() || { id: 1 };

    const memberships = Store.get('wellness_memberships', []);
    // Deactivate previous active memberships
    memberships.forEach(m => {
      if (m.user_id === currentUser.id) m.status = 'past';
    });

    const newMem = {
      id: Date.now(),
      user_id: currentUser.id,
      plan_name: plan.title,
      status: "active",
      session_limit: plan.session_limit,
      sessions_used: 0,
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
    };
    memberships.unshift(newMem);
    Store.set('wellness_memberships', memberships);

    return {
      success: true,
      membership: newMem,
      message: `Successfully enrolled in ${plan.title}!`
    };
  },

  // Wellness Goals
  async getWellnessGoals() {
    return {
      goals: Store.get('wellness_goals', {
        primary_goal: "cellular_detox",
        target_sessions_per_week: 3,
        preferred_temp: "Medium (55°C)",
        music_preference: "Solfeggio 528Hz Healing Tones",
        notes: "Support nervous system regulation."
      })
    };
  },

  async updateWellnessGoals(goalData) {
    Store.set('wellness_goals', goalData);
    return {
      success: true,
      goals: goalData,
      message: "Wellness preferences updated."
    };
  },

  // Notifications
  async getNotifications() {
    return {
      notifications: Store.get('wellness_notifications', [])
    };
  },

  async markNotificationRead(id) {
    const list = Store.get('wellness_notifications', []);
    const notif = list.find(n => n.id === parseInt(id));
    if (notif) notif.is_read = true;
    Store.set('wellness_notifications', list);
    return { success: true };
  },

  async markAllNotificationsRead() {
    const list = Store.get('wellness_notifications', []);
    list.forEach(n => n.is_read = true);
    Store.set('wellness_notifications', list);
    return { success: true };
  },

  // Profile
  async updateProfile(profileData) {
    const currentUser = this.getUser();
    if (!currentUser) throw new Error("Not authenticated");

    const users = Store.get('wellness_users', []);
    const u = users.find(item => item.id === currentUser.id);
    if (u) {
      if (profileData.full_name) u.full_name = profileData.full_name;
      if (profileData.phone) u.phone = profileData.phone;
      Store.set('wellness_users', users);
    }

    const updated = {
      ...currentUser,
      full_name: profileData.full_name || currentUser.full_name,
      phone: profileData.phone || currentUser.phone
    };

    if (localStorage.getItem('wellness_user')) {
      localStorage.setItem('wellness_user', JSON.stringify(updated));
    } else {
      sessionStorage.setItem('wellness_user', JSON.stringify(updated));
    }

    return {
      success: true,
      user: updated,
      message: "Profile details updated successfully."
    };
  },

  // Inquiries & Newsletter
  async submitInquiry(inquiryData) {
    const list = Store.get('wellness_inquiries', []);
    const newInquiry = {
      id: Date.now(),
      name: inquiryData.name,
      email: inquiryData.email,
      phone: inquiryData.phone || '',
      service: inquiryData.service || 'General Inquiry',
      subject: inquiryData.subject || 'Studio Inquiry',
      message: inquiryData.message,
      created_at: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
    list.unshift(newInquiry);
    Store.set('wellness_inquiries', list);

    return {
      success: true,
      message: "Thank you for reaching out! Our wellness concierge will contact you within 24 hours."
    };
  },

  async subscribeNewsletter(email) {
    const list = Store.get('wellness_newsletter', []);
    list.push({ email: email.trim(), subscribed_at: new Date().toISOString() });
    Store.set('wellness_newsletter', list);
    return {
      success: true,
      message: "Thank you for subscribing to the Wellness Journal!"
    };
  },

  // Admin Management Operations
  async getAdminStats() {
    const bookings = Store.get('wellness_bookings', []);
    const memberships = Store.get('wellness_memberships', []);
    const activeMembers = memberships.filter(m => m.status === 'active').length;

    let totalRev = 0;
    bookings.forEach(b => {
      totalRev += (b.price || 0);
    });
    // Add monthly membership revenue estimate
    totalRev += activeMembers * 249;

    const todayStr = new Date().toISOString().split('T')[0];
    const todayAppointments = bookings.filter(b => b.booking_date === todayStr && b.status !== 'cancelled').length;

    return {
      total_bookings: bookings.length,
      today_appointments: todayAppointments || 4,
      active_memberships: activeMembers,
      total_revenue: totalRev,
      service_distribution: [
        { title: "Full-Spectrum Infrared Sauna", booking_count: 14 },
        { title: "Clinical Red Light Therapy", booking_count: 9 },
        { title: "Contrast Therapy (Sauna + Plunge)", booking_count: 6 },
        { title: "Detox Glow Signature Ritual", booking_count: 5 }
      ]
    };
  },

  async getAdminBookings(filters = {}) {
    let bookings = Store.get('wellness_bookings', []);

    if (filters.status && filters.status !== 'all') {
      bookings = bookings.filter(b => b.status === filters.status);
    }
    if (filters.date) {
      bookings = bookings.filter(b => b.booking_date === filters.date);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      bookings = bookings.filter(b => 
        (b.client_name && b.client_name.toLowerCase().includes(q)) ||
        (b.client_email && b.client_email.toLowerCase().includes(q)) ||
        (b.booking_code && b.booking_code.toLowerCase().includes(q))
      );
    }

    return { bookings };
  },

  async updateAdminBooking(bookingId, updateData) {
    const bookings = Store.get('wellness_bookings', []);
    const b = bookings.find(item => item.id === parseInt(bookingId));
    if (!b) throw new Error("Appointment not found");

    if (updateData.status) b.status = updateData.status;
    Store.set('wellness_bookings', bookings);

    return {
      success: true,
      booking: b,
      message: `Appointment ${b.booking_code} marked as ${updateData.status}.`
    };
  },

  async getAdminClients() {
    const users = Store.get('wellness_users', []).filter(u => u.role !== 'admin');
    const memberships = Store.get('wellness_memberships', []);
    const bookings = Store.get('wellness_bookings', []);

    const clients = users.map(u => {
      const mem = memberships.find(m => m.user_id === u.id && m.status === 'active');
      const userBookings = bookings.filter(b => b.user_id === u.id || b.client_email === u.email);

      return {
        id: u.id,
        full_name: u.full_name,
        email: u.email,
        phone: u.phone,
        plan_name: mem ? mem.plan_name : null,
        session_limit: mem ? mem.session_limit : 0,
        sessions_used: mem ? mem.sessions_used : 0,
        total_bookings: userBookings.length,
        preferred_temp: "Medium (55°C)"
      };
    });

    return { clients };
  },

  async setAdminClientMembership(clientId, membershipData) {
    const memberships = Store.get('wellness_memberships', []);
    let mem = memberships.find(m => m.user_id === parseInt(clientId));

    if (mem) {
      if (membershipData.plan_name) mem.plan_name = membershipData.plan_name;
      if (membershipData.session_limit !== undefined) mem.session_limit = membershipData.session_limit;
      if (membershipData.sessions_used !== undefined) mem.sessions_used = membershipData.sessions_used;
      if (membershipData.status) mem.status = membershipData.status;
    } else {
      mem = {
        id: Date.now(),
        user_id: parseInt(clientId),
        plan_name: membershipData.plan_name || "Detox Glow Monthly",
        session_limit: membershipData.session_limit || 4,
        sessions_used: membershipData.sessions_used || 0,
        status: membershipData.status || "active",
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
      };
      memberships.push(mem);
    }

    Store.set('wellness_memberships', memberships);
    return { success: true, membership: mem };
  },

  async getAdminInquiries() {
    return {
      inquiries: Store.get('wellness_inquiries', [])
    };
  },

  async getAdminBlockedSlots() {
    return {
      blocked_slots: Store.get('wellness_blocked_slots', [])
    };
  },

  async blockSlot(slotDate, timeSlot, reason = 'Maintenance') {
    const blocked = Store.get('wellness_blocked_slots', []);
    const newSlot = {
      id: Date.now(),
      slot_date: slotDate,
      time_slot: timeSlot,
      reason: reason
    };
    blocked.push(newSlot);
    Store.set('wellness_blocked_slots', blocked);
    return { success: true, slot: newSlot };
  },

  async unblockSlot(blockId) {
    let blocked = Store.get('wellness_blocked_slots', []);
    blocked = blocked.filter(b => b.id !== parseInt(blockId));
    Store.set('wellness_blocked_slots', blocked);
    return { success: true };
  },

  // 10. Blog & Wellness Journal Methods
  async getBlogArticles(category = 'all', searchQuery = '') {
    let articles = Store.get('wellness_blog_articles', []);
    if (category && category.toLowerCase() !== 'all') {
      articles = articles.filter(a => a.category.toLowerCase() === category.toLowerCase());
    }
    if (searchQuery && searchQuery.trim() !== '') {
      const q = searchQuery.trim().toLowerCase();
      articles = articles.filter(a => 
        a.title.toLowerCase().includes(q) || 
        a.subtitle.toLowerCase().includes(q) || 
        a.summary.toLowerCase().includes(q) ||
        (a.tags && a.tags.some(t => t.toLowerCase().includes(q)))
      );
    }
    return articles;
  },

  async getBlogArticleById(idOrSlug) {
    const articles = Store.get('wellness_blog_articles', []);
    if (!idOrSlug) return articles[0];
    const found = articles.find(a => a.id === parseInt(idOrSlug) || a.slug === idOrSlug);
    return found || articles[0];
  },

  async getBlogComments(articleId) {
    const comments = Store.get('wellness_blog_comments', []);
    return comments.filter(c => c.article_id === parseInt(articleId));
  },

  async addBlogComment(articleId, commentData) {
    const comments = Store.get('wellness_blog_comments', []);
    const name = (commentData.name || 'Sanctuary Guest').trim();
    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'SG';
    
    const newComment = {
      id: Date.now(),
      article_id: parseInt(articleId),
      author_name: name,
      author_email: (commentData.email || '').trim(),
      message: (commentData.message || '').trim(),
      created_at: 'Just now',
      avatar_initials: initials
    };

    comments.unshift(newComment);
    Store.set('wellness_blog_comments', comments);
    return { success: true, comment: newComment };
  }
};

/**
 * Toast Notification System
 */
const Toast = {
  container: null,

  init() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
  },

  show(message, type = 'info', duration = 4000) {
    this.init();
    const toast = document.createElement('div');
    toast.className = `aura-toast toast-${type}`;
    
    let iconClass = 'bi-info-circle-fill text-primary';
    if (type === 'success') iconClass = 'bi-check-circle-fill text-success';
    if (type === 'error') iconClass = 'bi-exclamation-triangle-fill text-danger';
    if (type === 'warning') iconClass = 'bi-exclamation-circle-fill text-warning';

    toast.innerHTML = `
      <i class="bi ${iconClass} fs-5"></i>
      <div class="flex-grow-1" style="font-size: 0.92rem; font-weight: 500;">${message}</div>
      <button type="button" class="btn-close btn-close-sm" style="font-size: 0.75rem;" aria-label="Close"></button>
    `;

    const closeBtn = toast.querySelector('.btn-close');
    closeBtn.addEventListener('click', () => {
      toast.remove();
    });

    this.container.appendChild(toast);

    setTimeout(() => {
      if (toast.parentElement) {
        const isRtl = document.documentElement.getAttribute('dir') === 'rtl';
        toast.style.opacity = '0';
        toast.style.transform = isRtl ? 'translateX(-50px)' : 'translateX(50px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
      }
    }, duration);
  },

  success(msg) { this.show(msg, 'success'); },
  error(msg) { this.show(msg, 'error', 5000); },
  info(msg) { this.show(msg, 'info'); },
  warning(msg) { this.show(msg, 'warning'); }
};
