/* ==========================================================================
   Divy Jyot Foundation - Common UI Components (Dynamic Header & Footer)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function () {

  // 1. DYNAMIC HEADER INJECTION
  const headerPlaceholder = document.getElementById("header-placeholder");
  if (headerPlaceholder) {
    headerPlaceholder.innerHTML = `
      <div class="wrap">
        <div class="container">
          <div class="row">
            <div class="col-md-6 d-flex align-items-center">
              <p class="mb-0 phone pl-md-2" style="font-size: 13px; font-weight: 500;">
                <a href="tel:+919099038105" class="mr-3" style="color: rgba(255,255,255,0.8);"><span class="fa fa-phone mr-1"></span> +91 90990 38105</a> 
                <a href="mailto:contact@divyjyotgujarat.org" style="color: rgba(255,255,255,0.8);"><span class="fa fa-paper-plane mr-1"></span> contact@divyjyotgujarat.org</a>
              </p>
            </div>
            <div class="col-md-6 d-flex justify-content-md-end">
              <div class="social-media">
                <p class="mb-0 d-flex">
                  <a href="#" class="d-flex align-items-center justify-content-center" style="width:24px; height:24px; color:#fff; font-size:12px; margin-left: 10px; opacity:0.8;"><span class="fa fa-facebook"></span></a>
                  <a href="#" class="d-flex align-items-center justify-content-center" style="width:24px; height:24px; color:#fff; font-size:12px; margin-left: 10px; opacity:0.8;"><span class="fa fa-twitter"></span></a>
                  <a href="#" class="d-flex align-items-center justify-content-center" style="width:24px; height:24px; color:#fff; font-size:12px; margin-left: 10px; opacity:0.8;"><span class="fa fa-instagram"></span></a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <nav class="navbar navbar-expand-lg navbar-dark ftco_navbar bg-dark ftco-navbar-light" id="ftco-navbar">
        <div class="container">
          <a class="navbar-brand d-flex align-items-center" href="index.html" style="text-decoration: none;">
            <img src="logo.jpeg" alt="Divy Jyot Foundation Logo" style="height: 56px; width: 56px; margin-right: 12px; border-radius: 50%; border: 2px solid #fff; background: #fff; object-fit: cover;">
            <div>
              <span style="font-size: 21px; display: block; line-height: 1.1; font-weight: 800; letter-spacing: 0.5px; color: #fff;">DIVY JYOT</span>
              <span style="font-size: 11px; display: block; font-weight: 600; letter-spacing: 1.2px; color: #d81b60;">FOUNDATION</span>
            </div>
          </a>
          <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#ftco-nav" aria-controls="ftco-nav" aria-expanded="false" aria-label="Toggle navigation">
            <span class="fa fa-bars" style="color: #fff; font-size: 20px;"></span> Menu
          </button>

          <div class="collapse navbar-collapse" id="ftco-nav">
            <ul class="navbar-nav ml-auto">
              <li class="nav-item" id="nav-home"><a href="index.html" class="nav-link">Home</a></li>
              <li class="nav-item" id="nav-about"><a href="about.html" class="nav-link">About Us</a></li>
              <li class="nav-item" id="nav-campaign"><a href="campaign.html" class="nav-link">Campaign</a></li>
              <li class="nav-item" id="nav-services"><a href="services.html" class="nav-link">Services</a></li>
              <li class="nav-item" id="nav-team"><a href="team.html" class="nav-link">Team Profile</a></li>
              <li class="nav-item" id="nav-volunteer"><a href="volunteer.html" class="nav-link">Volunteer</a></li>
              <li class="nav-item" id="nav-contact"><a href="contact.html" class="nav-link">Contact</a></li>
              <li class="nav-item cta" id="nav-donate"><a href="donate.html" class="nav-link">Donate</a></li>
            </ul>
          </div>
        </div>
      </nav>
    `;
  }

  // 2. DYNAMIC FOOTER INJECTION
  const footerPlaceholder = document.getElementById("footer-placeholder");
  if (footerPlaceholder) {
    footerPlaceholder.innerHTML = `
      <footer class="footer">
        <div class="container">
          <div class="row">
            <div class="col-md-6 col-lg-3 mb-4 mb-md-0">
              <div class="d-flex align-items-center mb-4">
                <img src="logo.jpeg" alt="Divy Jyot Foundation Logo" style="height: 52px; width: 52px; margin-right: 12px; border-radius: 50%; border: 2px solid #fff; background: #fff; object-fit: cover;">
                <div>
                  <span style="font-size: 18px; display: block; line-height: 1.1; font-weight: 800; letter-spacing: 0.5px; color: #fff; font-family: Montserrat, sans-serif;">DIVY JYOT</span>
                  <span style="font-size: 10px; display: block; font-weight: 600; letter-spacing: 1.2px; color: #d81b60; font-family: Montserrat, sans-serif;">FOUNDATION</span>
                </div>
              </div>
              <p style="font-size: 14px; line-height: 1.6; color: #94a3b8;">
                Divy Jyot Foundation is a registered social impact organization dedicated to creating awareness about food safety, educating consumers, supporting regulatory compliance, and working towards a healthier, adulteration-free Gujarat.
              </p>
              <div class="mb-4" style="font-size: 13.5px; color: #cbd5e1; line-height: 1.8;">
                <p class="mb-1"><span class="fa fa-map-marker mr-2" style="color:#d81b60;"></span> Ahmedabad, Gujarat, India</p>
                <p class="mb-1"><span class="fa fa-phone mr-2" style="color:#d81b60;"></span> General: +91 90990 38105</p>
                <p class="mb-1"><span class="fa fa-phone mr-2" style="color:#d81b60;"></span> Helpline: +91 87805 18680</p>
                <p class="mb-1"><span class="fa fa-envelope mr-2" style="color:#d81b60;"></span> contact@divyjyotgujarat.org</p>
              </div>
              <ul class="ftco-footer-social p-0 mb-4 d-flex">
                <li style="list-style:none; margin-right:8px;"><a href="#" data-toggle="tooltip" data-placement="top" title="Facebook" class="d-flex align-items-center justify-content-center" style="width:36px; height:36px; border-radius:50%;"><span class="fa fa-facebook"></span></a></li>
                <li style="list-style:none; margin-right:8px;"><a href="#" data-toggle="tooltip" data-placement="top" title="Twitter" class="d-flex align-items-center justify-content-center" style="width:36px; height:36px; border-radius:50%;"><span class="fa fa-twitter"></span></a></li>
                <li style="list-style:none; margin-right:8px;"><a href="#" data-toggle="tooltip" data-placement="top" title="Instagram" class="d-flex align-items-center justify-content-center" style="width:36px; height:36px; border-radius:50%;"><span class="fa fa-instagram"></span></a></li>
              </ul>
              <p><a href="donate.html" class="btn btn-primary px-4 py-2" style="font-size:13px; border-radius:30px !important;">Support Our Work</a></p>
            </div>
            <div class="col-md-6 col-lg-3 mb-4 mb-md-0">
              <h2 class="footer-heading" style="font-family: Montserrat, sans-serif;">Latest News</h2>
              <div class="block-21 mb-4 d-flex">
                <div class="text">
                  <h3 class="heading" style="font-size: 14px; font-weight:600; line-height: 1.4; margin-bottom: 5px;"><a href="campaign.html" style="color: #cbd5e1;">Gujarat Food Safety Campaign Launched</a></h3>
                  <div class="meta" style="font-size: 11px; color: #64748b;">
                    <span class="fa fa-calendar mr-1"></span> Jul 15, 2026 &nbsp;&bull;&nbsp; <span class="fa fa-user mr-1"></span> Admin
                  </div>
                </div>
              </div>
              <div class="block-21 mb-4 d-flex">
                <div class="text">
                  <h3 class="heading" style="font-size: 14px; font-weight:600; line-height: 1.4; margin-bottom: 5px;"><a href="volunteer.html" style="color: #cbd5e1;">Phase 2 Volunteer Drive Begins</a></h3>
                  <div class="meta" style="font-size: 11px; color: #64748b;">
                    <span class="fa fa-calendar mr-1"></span> Jul 10, 2026 &nbsp;&bull;&nbsp; <span class="fa fa-user mr-1"></span> Admin
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-6 col-lg-3 pl-lg-4 mb-4 mb-md-0">
              <h2 class="footer-heading" style="font-family: Montserrat, sans-serif;">Current Activity</h2>
              <ul class="list-unstyled" style="font-size:14px; line-height:2.0;">
                <li><a href="campaign.html" class="py-1 d-block" style="color: #94a3b8;"><span class="fa fa-chevron-right mr-2" style="font-size:10px; color:#d81b60;"></span>Vadodara Adulteration Camp</a></li>
                <li><a href="campaign.html" class="py-1 d-block" style="color: #94a3b8;"><span class="fa fa-chevron-right mr-2" style="font-size:10px; color:#d81b60;"></span>Ahmedabad School Outreach</a></li>
                <li><a href="campaign.html" class="py-1 d-block" style="color: #94a3b8;"><span class="fa fa-chevron-right mr-2" style="font-size:10px; color:#d81b60;"></span>Surat Milk Testing Campaign</a></li>
                <li><a href="campaign.html" class="py-1 d-block" style="color: #94a3b8;"><span class="fa fa-chevron-right mr-2" style="font-size:10px; color:#d81b60;"></span>Rajkot Public Seminars</a></li>
                <li><a href="about.html" class="py-1 d-block" style="color: #94a3b8;"><span class="fa fa-chevron-right mr-2" style="font-size:10px; color:#d81b60;"></span>Interactive Footprint Map</a></li>
              </ul>
            </div>
            <div class="col-md-6 col-lg-3 mb-4 mb-md-0">
              <h2 class="footer-heading" style="font-family: Montserrat, sans-serif;">Quick Links</h2>
              <ul class="list-unstyled" style="font-size:14px; line-height:2.0;">
                <li><a href="index.html" class="py-1 d-block" style="color: #94a3b8;"><span class="fa fa-chevron-right mr-2" style="font-size:10px; color:#d81b60;"></span>Home</a></li>
                <li><a href="about.html" class="py-1 d-block" style="color: #94a3b8;"><span class="fa fa-chevron-right mr-2" style="font-size:10px; color:#d81b60;"></span>About Us</a></li>
                <li><a href="campaign.html" class="py-1 d-block" style="color: #94a3b8;"><span class="fa fa-chevron-right mr-2" style="font-size:10px; color:#d81b60;"></span>Our Campaign</a></li>
                <li><a href="services.html" class="py-1 d-block" style="color: #94a3b8;"><span class="fa fa-chevron-right mr-2" style="font-size:10px; color:#d81b60;"></span>Services & Helpline</a></li>
                <li><a href="team.html" class="py-1 d-block" style="color: #94a3b8;"><span class="fa fa-chevron-right mr-2" style="font-size:10px; color:#d81b60;"></span>Team Profile</a></li>
                <li><a href="volunteer.html" class="py-1 d-block" style="color: #94a3b8;"><span class="fa fa-chevron-right mr-2" style="font-size:10px; color:#d81b60;"></span>Volunteer Sign-Up</a></li>
                <li><a href="contact.html" class="py-1 d-block" style="color: #94a3b8;"><span class="fa fa-chevron-right mr-2" style="font-size:10px; color:#d81b60;"></span>Contact Us</a></li>
              </ul>
            </div>
          </div>
          <div class="row mt-5" style="border-top: 1px solid rgba(255,255,255,0.06); padding-top: 25px;">
            <div class="col-md-12 text-center">
              <p class="copyright" style="font-size: 13px; color: #64748b; margin-bottom:0;">
                Copyright &copy; ${new Date().getFullYear()} All rights reserved | <b>Divy Jyot Foundation</b> | <span style="color:#cbd5e1; font-weight:600;">Regd. No. F/21350/GUJ/21766</span> 
              </p>
            </div>
          </div>
        </div>
      </footer>
    `;
  }

  // 3. HIGHLIGHT THE ACTIVE NAVIGATION LINK
  const path = window.location.pathname;
  const page = path.split("/").pop();

  // Clear any existing active classes
  const navItems = document.querySelectorAll("#ftco-navbar .navbar-nav .nav-item");
  navItems.forEach(item => item.classList.remove("active"));

  if (page === "index.html" || page === "" || page === "/") {
    document.getElementById("nav-home")?.classList.add("active");
  } else if (page === "about.html") {
    document.getElementById("nav-about")?.classList.add("active");
  } else if (page === "campaign.html") {
    document.getElementById("nav-campaign")?.classList.add("active");
  } else if (page === "services.html") {
    document.getElementById("nav-services")?.classList.add("active");
  } else if (page === "team.html") {
    document.getElementById("nav-team")?.classList.add("active");
  } else if (page === "volunteer.html") {
    document.getElementById("nav-volunteer")?.classList.add("active");
  } else if (page === "contact.html") {
    document.getElementById("nav-contact")?.classList.add("active");
  } else if (page === "donate.html") {
    document.getElementById("nav-donate")?.classList.add("active");
  }
});
