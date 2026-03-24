(function () {
  // Replace the Google Form action URL and entry IDs with the live form values.
  window.SBICAdmissionConfig = {
    googleForm: {
      action: "https://docs.google.com/forms/d/e/1FAIpQLScmbnlEAfCvVRO1CBs7v-niRiiyx-e7uEVAmRWodghyH8NLcg/formResponse",
      fields: {
        name: "entry.864934871",
        className: "entry.1333542661",
        mobile: "entry.445818611"
      }
    },
    whatsapp: {
      baseUrl: "https://wa.me/918400585469",
      template:
        "Namaste, I am {name}. I have submitted an admission enquiry for {className}. My mobile number is {mobile}. Please share the next steps."
    },
    links: {
      app: "https://digitalapp.biz/sbic_mirzapur/app/",
      map: "https://maps.google.com/?q=Savitri+Balika+Inter+College+Mirzapur",
      website: "https://savitribalikaintercollege.netlify.app"
    },
    audio: {
      // Best effort autoplay: some browsers still require the first user interaction.
      useFile: true,
      volume: 1,
      gainBoost: 1.3,
      autoplay: true,
      loop: false,
      tone: [523.25, 659.25, 783.99]
    }
  };
})();
