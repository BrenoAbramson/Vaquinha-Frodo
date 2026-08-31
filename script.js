const carousel = document.querySelector(".carousel");
const donationGoal = 4000;
const donationRaised = 1285;
const raisedAmount = document.querySelector("#raisedAmount");
const progressBar = document.querySelector("#progressBar");
const paymentModal = document.querySelector(".payment-modal");
const paymentTriggers = document.querySelectorAll(".payment-trigger");
const paymentClose = document.querySelector(".payment-close");
const pixKey = document.querySelector("#pixKey");
const copyPix = document.querySelector("#copyPix");
const copyPixStatus = document.querySelector("#copyPixStatus");
const paymentPanels = document.querySelectorAll("[data-payment-panel]");
const showMessageForm = document.querySelector("[data-show-message-form]");
const showPixPanel = document.querySelector("[data-show-pix-panel]");
const supporterForm = document.querySelector(".supporter-form");
const supporterName = document.querySelector("#supporterName");
const supporterMessage = document.querySelector("#supporterMessage");
const supporterFormStatus = document.querySelector("#supporterFormStatus");
const supporterList = document.querySelector("#supporterList");
const supporterCount = document.querySelector("#supporterCount");
const supportersStorageKey = "frodoSupporterMessagesV2";

const formatCurrency = (value) => {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
};

const escapeHTML = (value) => {
  return value.replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#039;"
    };

    return entities[character];
  });
};

if (raisedAmount && progressBar) {
  const progress = Math.min((donationRaised / donationGoal) * 100, 100);
  raisedAmount.textContent = formatCurrency(donationRaised);
  progressBar.style.width = `${progress}%`;
}

const getSupporters = () => {
  try {
    return JSON.parse(localStorage.getItem(supportersStorageKey)) || [];
  } catch {
    return [];
  }
};

const saveSupporters = (supporters) => {
  localStorage.setItem(supportersStorageKey, JSON.stringify(supporters));
};

const renderSupporters = () => {
  if (!supporterList || !supporterCount) {
    return;
  }

  const supporters = getSupporters();

  if (!supporters.length) {
    supporterCount.textContent = "A lista de apoiadores aparecerá em breve.";
    supporterList.className = "mt-8 rounded bg-card p-5 text-sm leading-6 text-muted shadow-card";
    supporterList.textContent = "Ainda não há apoiadores exibidos aqui.";
    return;
  }

  supporterCount.textContent = `${supporters.length} ${supporters.length === 1 ? "pessoa deixou" : "pessoas deixaram"} mensagem`;
  supporterList.className = "supporter-list mt-8";
  supporterList.innerHTML = supporters
    .map((supporter) => {
      const name = escapeHTML(supporter.name);
      const message = escapeHTML(supporter.message);
      const initial = escapeHTML(supporter.name.trim().charAt(0).toUpperCase());

      return `
        <article class="supporter-card">
          <div class="supporter-avatar">${initial}</div>
          <div>
            <h3 class="supporter-name">${name}</h3>
            <p class="supporter-message">"${message}"</p>
          </div>
        </article>
      `;
    })
    .join("");
};

if (paymentModal) {
  const setPaymentPanel = (panelName) => {
    paymentPanels.forEach((panel) => {
      panel.classList.toggle("is-active", panel.dataset.paymentPanel === panelName);
    });
  };

  const openPaymentModal = () => {
    setPaymentPanel("pix");
    paymentModal.classList.add("is-open");
    paymentModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  };

  const closePaymentModal = () => {
    paymentModal.classList.remove("is-open");
    paymentModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    copyPixStatus.textContent = "";
    supporterFormStatus.textContent = "";
    supporterForm.reset();
  };

  paymentTriggers.forEach((trigger) => {
    trigger.addEventListener("click", openPaymentModal);
  });

  paymentClose.addEventListener("click", closePaymentModal);

  paymentModal.addEventListener("click", (event) => {
    if (event.target === paymentModal) {
      closePaymentModal();
    }
  });

  copyPix.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(pixKey.value);
      copyPixStatus.textContent = "Chave Pix copiada.";
    } catch {
      pixKey.select();
      document.execCommand("copy");
      copyPixStatus.textContent = "Chave Pix copiada.";
    }
  });

  showMessageForm.addEventListener("click", () => {
    setPaymentPanel("message");
    supporterName.focus();
  });

  showPixPanel.addEventListener("click", () => {
    setPaymentPanel("pix");
  });

  supporterForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = supporterName.value.trim();
    const message = supporterMessage.value.trim();

    if (!name || !message) {
      supporterFormStatus.textContent = "Preencha nome e mensagem.";
      return;
    }

    const supporters = getSupporters();
    supporters.unshift({ name, message });
    saveSupporters(supporters.slice(0, 8));
    renderSupporters();
    closePaymentModal();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && paymentModal.classList.contains("is-open")) {
      closePaymentModal();
    }
  });
}

renderSupporters();

if (carousel) {
  const slides = [...carousel.querySelectorAll(".carousel-slide")];
  const dots = [...carousel.querySelectorAll(".carousel-dot")];
  const previousButton = carousel.querySelector(".carousel-button-prev");
  const nextButton = carousel.querySelector(".carousel-button-next");
  const lightbox = document.querySelector(".lightbox");
  const lightboxImage = document.querySelector(".lightbox-image");
  const lightboxClose = document.querySelector(".lightbox-close");
  const lightboxPreviousButton = document.querySelector(".lightbox-button-prev");
  const lightboxNextButton = document.querySelector(".lightbox-button-next");
  let currentSlide = 0;
  let autoplayId;

  const showSlide = (nextSlide) => {
    currentSlide = (nextSlide + slides.length) % slides.length;

    slides.forEach((slide, index) => {
      slide.classList.toggle("is-active", index === currentSlide);
    });

    dots.forEach((dot, index) => {
      dot.classList.toggle("is-active", index === currentSlide);
    });
  };

  const startAutoplay = () => {
    clearInterval(autoplayId);
    autoplayId = setInterval(() => {
      showSlide(currentSlide + 1);
    }, 4500);
  };

  previousButton.addEventListener("click", () => {
    showSlide(currentSlide - 1);
    startAutoplay();
  });

  nextButton.addEventListener("click", () => {
    showSlide(currentSlide + 1);
    startAutoplay();
  });

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      showSlide(index);
      startAutoplay();
    });
  });

  const updateLightboxImage = () => {
    const activeSlide = slides[currentSlide];
    lightboxImage.src = activeSlide.src;
    lightboxImage.alt = activeSlide.alt;
  };

  const openLightbox = (index) => {
    showSlide(index);
    updateLightboxImage();
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-open");
  };

  const closeLightbox = () => {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    lightboxImage.src = "";
    document.body.classList.remove("lightbox-open");
  };

  slides.forEach((slide) => {
    slide.addEventListener("click", () => {
      const slideIndex = slides.indexOf(slide);
      openLightbox(slideIndex);
    });
  });

  lightboxClose.addEventListener("click", closeLightbox);

  lightboxPreviousButton.addEventListener("click", () => {
    showSlide(currentSlide - 1);
    updateLightboxImage();
    startAutoplay();
  });

  lightboxNextButton.addEventListener("click", () => {
    showSlide(currentSlide + 1);
    updateLightboxImage();
    startAutoplay();
  });

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && lightbox.classList.contains("is-open")) {
      closeLightbox();
    }

    if (event.key === "ArrowLeft" && lightbox.classList.contains("is-open")) {
      showSlide(currentSlide - 1);
      updateLightboxImage();
      startAutoplay();
    }

    if (event.key === "ArrowRight" && lightbox.classList.contains("is-open")) {
      showSlide(currentSlide + 1);
      updateLightboxImage();
      startAutoplay();
    }
  });

  startAutoplay();
}
