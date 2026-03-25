// Visa Page JavaScript
// Tab functionality and Visa Eligibility Checker

document.addEventListener('DOMContentLoaded', function() {
  // Tab functionality
  const tabs = document.querySelectorAll('#visa-policy-tabs button');
  const tabPanes = document.querySelectorAll('.tab-pane');

  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      const tabId = this.getAttribute('data-tab');

      // Update tab buttons
      tabs.forEach(t => {
        t.classList.remove('active', 'border-rose-600', 'text-rose-600');
        t.classList.add('border-transparent');
        t.setAttribute('aria-selected', 'false');
      });

      this.classList.add('active', 'border-rose-600', 'text-rose-600');
      this.classList.remove('border-transparent');
      this.setAttribute('aria-selected', 'true');

      // Update tab panes
      tabPanes.forEach(pane => {
        pane.classList.remove('active');
        pane.classList.add('hidden');
      });

      const activePane = document.getElementById(tabId);
      if (activePane) {
        activePane.classList.add('active');
        activePane.classList.remove('hidden');
      }
    });
  });

  // Visa eligibility checker
  const checkEligibilityBtn = document.getElementById('check-eligibility');
  const resultDiv = document.getElementById('result');
  const tripSelect = document.getElementById('trip');
  const ticketGroup = document.getElementById('ticket-group');

  // Show ticket field only when trip is transit
  if (tripSelect && ticketGroup) {
    tripSelect.addEventListener('change', function() {
      if (this.value === 'transit') {
        ticketGroup.style.display = 'block';
      } else {
        ticketGroup.style.display = 'none';
      }
    });
    // Initial check
    if (tripSelect.value !== 'transit') {
      ticketGroup.style.display = 'none';
    }
  }

  if (checkEligibilityBtn) {
    checkEligibilityBtn.addEventListener('click', function() {
      const nat = document.getElementById('nationality').value;
      const arrivalDate = document.getElementById('arrival-date').value;
      const departureDate = document.getElementById('departure-date').value;
      const trip = document.getElementById('trip').value;
      const ticket = document.getElementById('ticket').value;

      const errors = [];
      let days = 0;
      let hours = 0;

      if (nat === '') errors.push('Please select nationality');
      if (!arrivalDate || !departureDate) errors.push('Please select arrival and departure dates');
      if (arrivalDate>departureDate) errors.push('Departure date must be on arrival date or later');
      
      if (arrivalDate && departureDate) {
        // Calculate days between arrival and departure
        // According to the new policy, 240 hours starts from 00:00 the day after entry
        const arrival = new Date(arrivalDate);
        const departure = new Date(departureDate);
        
        // Start counting from 00:00 the day after arrival
        const startDate = new Date(arrival);
        startDate.setDate(startDate.getDate() + 1);
        startDate.setHours(0, 0, 0, 0);
        
        // End at 23:59:59 of departure date
        const endDate = new Date(departure);
        endDate.setHours(23, 59, 59, 999);
        hours = (endDate - startDate) / (1000 * 60 * 60);
        days = Math.ceil(hours / 24);

        if (trip === 'transit' && nat == 'eligible_transit_hainan') {
          if (days > 10) {
            errors.push(`Stay of ${days} days exceeds the maximum 10 days (240 hours)`);
          }
        }
      }
      if (trip === 'hainan') {
          if (days > 30) {
            errors.push(`Stay of ${days} days exceeds the maximum 30 days (720 hours)`);
          }
        }
      if ((nat === 'eligible_all' || nat === 'eligible_30days_hainan' || nat === 'eligible_30days') ) {
          if (days > 30) {
            errors.push(`Stay of ${days} days exceeds the maximum 30 days (720 hours)`);
          }
        }
      if (nat === 'not_eligible' && trip === 'transit') {
          if (days > 1) {
            errors.push(`Stay of ${days} days exceeds the maximum 1 day (24 hours)`);
          }
        }


      
      if (nat == 'not_eligible' && trip !== 'transit') errors.push('Nationality not eligible for visa-free policy, please apply for a visa');
      if (trip == 'to_china' ) errors.push('Must be transit to a third country / direct flight to Hainan / round trip to China, please apply for a visa');
      if (trip == 'transit' && ticket !== 'yes') errors.push('Must have confirmed onward ticket, please apply for a visa');
      if (trip == 'round' && nat == 'eligible_transit_hainan') errors.push('Nationality not eligible for visa-free policy, please apply for a visa');
      if ((trip == 'round' || trip == 'transit') && nat == 'eligible_hainan') errors.push('Nationality not eligible for visa-free policy, please apply for a visa');
      

      if (errors.length === 0) {
        resultDiv.className = 'mt-4 p-4 rounded-lg bg-green-50 border border-green-200';
        let message = '';
        
        // eligible_30days: 无论trip是什么，都显示30天免签政策
        if (nat === 'eligible_30days' && trip!=='to_china') {
          message = `
            <strong class="text-green-700">✅ ELIGIBLE for 30-day visa-free policy</strong><br>

            <span class="text-green-600">Stay period: ${days} days (${hours.toFixed(1)} hours) from the 00:00 day after arrival</span><br><br>
            <strong class="text-green-700">Notes & Tips:</strong><br>
            <span class="text-green-600">• <strong>Prepare materials:</strong> Valid passport (≥6 months validity), completed <a href="2.pre-visa-guide.html" target="_blank" class="text-rose-600 hover:text-slate-700 hover:underline" title="Temporary Entry Card for Foreigners Guide">"Temporary Entry Card for Foreigners"</a>, and hotel reservation.<br> <br> 
            • <strong>Airport procedure:</strong>  Immigration will verify your onward ticket and departure plans.<br><br> 
            • <strong>Policy validity period:</strong> 30-day visa-free policy extended until December 31, 2026.<br><br>
            • <strong>Special note:</strong> Although visa-free, it is recommended to prepare return tickets, hotel reservations, and other travel-related documents for immigration inspection.<br><br>
            • <strong>Inquiries:</strong> For questions related to visa policies and connecting itineraries etc., please contact +86 12367.</span>
          `;
        }
        // eligible_hainan: trip必须是hainan，显示海南政策
        else if (nat === 'eligible_30days_hainan' && (trip === 'transit' || trip === 'round')) {
          message = `
            <strong class="text-green-700">✅ ELIGIBLE for 30-day visa-free policy</strong><br>

            <span class="text-green-600">Stay period: ${days} days (${hours.toFixed(1)} hours) from the 00:00 day after arrival</span><br><br>
            <strong class="text-green-700">Notes & Tips:</strong><br>
            <span class="text-green-600">• <strong>Prepare materials:</strong> Valid passport (≥6 months validity), completed <a href="2.pre-visa-guide.html" target="_blank" class="text-rose-600 hover:text-slate-700 hover:underline" title="Temporary Entry Card for Foreigners Guide">"Temporary Entry Card for Foreigners"</a>, and hotel reservation.<br> <br> 
            • <strong>Airport procedure:</strong>  Immigration will verify your onward ticket and departure plans.<br><br> 
            • <strong>Policy validity period:</strong> 30-day visa-free policy extended until December 31, 2026.<br><br>
            • <strong>Special note:</strong> Although visa-free, it is recommended to prepare return tickets, hotel reservations, and other travel-related documents for immigration inspection.<br><br>
            • <strong>Inquiries:</strong> For questions related to visa policies and connecting itineraries etc., please contact +86 12367.</span>
          `;
        }
        

        // eligible_hainan: trip必须是hainan，显示海南政策
        else if (nat === 'eligible_hainan' && trip === 'hainan') {
          message = `
            <strong class="text-green-700">✅ ELIGIBLE for Hainan 30-day visa-free policy</strong><br>
            <span class="text-green-600">Stay period: ${days} days (${hours.toFixed(1)} hours) from 00:00 of day after entry</span><br><br>
            <strong class="text-green-700">Notes & Tips:</strong><br>
            <span class="text-green-600">• <strong>Prepare materials:</strong> Valid passport (≥6 months validity), completed <a href="2.pre-visa-guide.html" target="_blank" class="text-rose-600 hover:text-slate-700 hover:underline" title="Temporary Entry Card for Foreigners Guide">"Temporary Entry Card for Foreigners"</a>, and hotel reservation.<br> <br> 
            • <strong>Airport procedure:</strong> Follow "Hainan visa-free" signs to dedicated counters. Immigration will verify your travel documents.<br><br> 
             <strong>Activity restrictions:</strong> Only Hainan province.Up to 30 days<br><br>
            • <strong>Special note:</strong> Although visa-free, it is recommended to prepare return tickets, hotel reservations, and other travel-related documents for immigration inspection.<br><br>
            • <strong>Inquiries:</strong> For questions related to visa policies and connecting itineraries etc., please contact +86 12367.</span>
          `;
        }
        // eligible_transit_hainan: trip是transit显示240小时过境，trip是hainan显示海南政策
        else if (nat === 'eligible_transit_hainan' && trip === 'transit') {
          message = `
            <strong class="text-green-700">✅ ELIGIBLE for 240-hour transit without visa</strong><br>
            <span class="text-green-600">240-hour Transit stay period: ${days} days (${hours.toFixed(1)} hours) from the 00:00 day after entry</span><br><br>
            <strong class="text-green-700">Notes & Tips:</strong><br>
            <span class="text-green-600">• <strong>Prepare materials:</strong> Valid passport (≥6 months validity), completed <a href="2.pre-visa-guide.html" target="_blank" class="text-rose-600 hover:text-slate-700 hover:underline" title="Temporary Entry Card for Foreigners Guide">"Temporary Entry Card for Foreigners"</a>, hotel reservation, and confirmed onward ticket.<br> <br> 
            • <strong>Airport procedure:</strong> Follow "240-hour visa-free transit" signs to dedicated counters. Immigration will verify your onward ticket and departure plans.<br><br> 
            • <strong>Departure restrictions:</strong> Must hold valid international travel documents and confirmed connecting tickets for international flights, ships, or trains transiting through China to a third country or region.<br><br> 
            • <strong>Inquiries:</strong> For questions related to visa policies and connecting itineraries etc., please contact +86 12367.</span>
          `;
        }
        else if (nat === 'eligible_transit_hainan' && trip === 'hainan') {
          message = `
            <strong class="text-green-700">✅ ELIGIBLE for Hainan 30-day visa-free policy</strong><br>
            <span class="text-green-600">Stay period: ${days} days (${hours.toFixed(1)} hours) from 00:00 of day after entry</span><br><br>
            <strong class="text-green-700">Notes & Tips:</strong><br>
            <span class="text-green-600">• <strong>Prepare materials:</strong> Valid passport (≥6 months validity), completed <a href="2.pre-visa-guide.html" target="_blank" class="text-rose-600 hover:text-slate-700 hover:underline" title="Temporary Entry Card for Foreigners Guide">"Temporary Entry Card for Foreigners"</a>, and hotel reservation.<br> <br> 
            • <strong>Airport procedure:</strong> Follow "Hainan visa-free" signs to dedicated counters. Immigration will verify your travel documents.<br><br> 
            • <strong>Activity restrictions:</strong> Only Hainan province.Up to 30 days<br><br>
            • <strong>Special note:</strong> Although visa-free, it is recommended to prepare return tickets, hotel reservations, and other travel-related documents for immigration inspection.<br><br>
            • <strong>Inquiries:</strong> For questions related to visa policies and connecting itineraries etc., please contact +86 12367.</span>
          `;
        }
        // eligible_all: trip是round，显示30天免签政策
        else if (nat === 'eligible_all' && trip === 'round') {
          message = `
            <strong class="text-green-700">✅ ELIGIBLE for 30-day visa-free policy</strong><br>
            <span class="text-green-600">Stay period: ${days} days (${hours.toFixed(1)} hours) from the 00:00 day after arrival</span><br><br>
            <strong class="text-green-700">Notes & Tips:</strong><br>
            <span class="text-green-600">• <strong>Prepare materials:</strong> Valid passport (≥6 months validity), completed <a href="2.pre-visa-guide.html" target="_blank" class="text-rose-600 hover:text-slate-700 hover:underline" title="Temporary Entry Card for Foreigners Guide">"Temporary Entry Card for Foreigners"</a>, and hotel reservation.<br> <br> 
            • <strong>Airport procedure:</strong>  Immigration will verify your onward ticket and departure plans.<br><br> 
            • <strong>Policy validity period:</strong> 30-day visa-free policy extended until December 31, 2026.<br><br>
            • <strong>Special note:</strong> Although visa-free, it is recommended to prepare return tickets, hotel reservations, and other travel-related documents for immigration inspection.<br><br>
            • <strong>Inquiries:</strong> For questions related to visa policies and connecting itineraries etc., please contact +86 12367.</span>
          `;

        }
        // eligible_all: trip是transit，显示30天免签政策 + 240小时过境免签政策
        else if (nat === 'eligible_all' && trip === 'transit') {
          message = `
            <strong class="text-green-700">✅ ELIGIBLE for 30-day visa-free policy & 240-hour transit without visa</strong><br>
            <span class="text-green-600">Stay period: ${days} days (${hours.toFixed(1)} hours) from the 00:00 day after arrival</span><br><br>
            <strong class="text-green-700">Notes & Tips:</strong><br>
            <span class="text-green-600">• <strong>Prepare materials:</strong> Valid passport (≥6 months validity), completed <a href="2.pre-visa-guide.html" target="_blank" class="text-rose-600 hover:text-slate-700 hover:underline" title="Temporary Entry Card for Foreigners Guide">"Temporary Entry Card for Foreigners"</a>, and hotel reservation.<br> <br> 
            • <strong>Airport procedure:</strong>  Immigration will verify your onward ticket and departure plans.<br><br> 
            • <strong>Policy validity period:</strong> 30-day visa-free policy extended until December 31, 2026.<br><br>
            • <strong>Special note:</strong> Although visa-free, it is recommended to prepare return tickets, hotel reservations, and other travel-related documents for immigration inspection.<br><br>
            • <strong>Inquiries:</strong> For questions related to visa policies and connecting itineraries etc., please contact +86 12367.</span>
          `;
        }

        // eligible_all: trip是hainan，显示30天免签政策 + Hainan 30天免签政策
        else if ((nat === 'eligible_all'||nat==='eligible_30days_hainan') && trip === 'hainan') {
          message = `
            <strong class="text-green-700">✅ ELIGIBLE for 30-day visa-free policy & Hainan visa-free policy</strong><br>
            <span class="text-green-600">Stay period: ${days} days (${hours.toFixed(1)} hours) from the 00:00 day after arrival</span><br><br>
            <strong class="text-green-700">Notes & Tips:</strong><br>
            <span class="text-green-600">• <strong>Prepare materials:</strong> Valid passport (≥6 months validity), completed <a href="2.pre-visa-guide.html" target="_blank" class="text-rose-600 hover:text-slate-700 hover:underline" title="Temporary Entry Card for Foreigners Guide">"Temporary Entry Card for Foreigners"</a>, and hotel reservation.<br> <br> 
            • <strong>Airport procedure:</strong>  Immigration will verify your onward ticket and departure plans.<br><br> 
            • <strong>Policy validity period:</strong> 30-day visa-free policy extended until December 31, 2026.<br><br>
            • <strong>Special note:</strong> Although visa-free, it is recommended to prepare return tickets, hotel reservations, and other travel-related documents for immigration inspection.<br><br>
            • <strong>Inquiries:</strong> For questions related to visa policies and connecting itineraries etc., please contact +86 12367.</span>
          `;
        }
         // non_eligible: 显示24小时过境签 政策
        else if (nat === 'not_eligible' && trip === 'transit') {
          message = `
            <strong class="text-green-700">✅ ELIGIBLE for 24-hour transit without visa</strong><br>
            <span class="text-green-600">Stay period: ${days} days (${hours.toFixed(1)} hours) from arrival time</span><br>
            <strong class="text-green-700">Notes & Tips:</strong><br>
            <span class="text-green-600">• <strong>Prepare materials:</strong> Valid passport (≥6 months validity), completed <a href="guide.html" target="_blank" class="text-rose-600 hover:text-slate-700 hover:underline" title="Temporary Entry Card for Foreigners Guide">"Temporary Entry Card for Foreigners"</a>, and hotel reservation.<br> <br>  
            • <strong>Activity restrictions:</strong> If staying within the port restricted area for no more than 24 hours, no visa is required; if leaving the port restricted area, a temporary entry permit must be obtained from the port immigration inspection authority.<br><br> 
            • <strong>Inquiries:</strong> For questions related to visa policies and connecting itineraries etc., please contact +86 12367.</span>
          `;
        }
        resultDiv.innerHTML = message;
      } else {
        resultDiv.className = 'mt-4 p-4 rounded-lg bg-red-50 border border-red-200';
        resultDiv.innerHTML = `<strong class="text-red-700">❌ NOT ELIGIBLE</strong><br><span class="text-red-600">` + errors.join('<br>') + '</span>';
      }
    });
  }

});