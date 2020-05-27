if (!localStorage.getItem("voterId")) {
  localStorage.setItem("voterId", String(Math.random()));
}

const voterId = localStorage.getItem("voterId");

const query = `
  query {
    Section(id: "section_7470"){
      options{
        ... on Item {
          _id
          name{
            en
          }
          image{
            asset{
              url
            }
          }
        }
      }
    }
  }`;

const renderDonut = (donut) => `
  <section class="donut" id="${donut._id}">
    <img src="${donut.image.asset.url}" alt="${donut.name.en}"/>
    <h2 class="vote-count">0</h2>
    <button onclick="vote('${donut._id}')">${donut.name.en}</button>
  </section>`;

const fetchDonuts = async () => {
  const response = await fetch(
    `https://czqk28jt.api.sanity.io/v1/graphql/prod_th/default`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    }
  );
  const {
    data: {
      Section: { options },
    },
  } = await response.json();
  const displayDonuts = options.filter(
    (option) => option.name?.en && option.image?.asset?.url
  );
  main.innerHTML = displayDonuts.map((donut) => renderDonut(donut)).join("");
  fetchVotes();
};

const vote = async (donutId) => {
  localStorage.setItem("selectedDonutId", donutId);
  await fetch("/votes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ donut: donutId, voter: voterId }),
  });
  fetchVotes();
};

const fetchVotes = async () => {
  const response = await fetch("/votes");
  const votes = await response.json();
  const selectedDonutId = localStorage.getItem("selectedDonutId");
  document.querySelectorAll(".donut").forEach((donut) => {
    donut.querySelector(".vote-count").textContent = votes[donut.id] || 0;
    if (donut.id !== selectedDonutId) {
      donut.classList.remove("selected");
    }
  });
  if (selectedDonutId) {
    document.getElementById(selectedDonutId).classList.add("selected");
  }
};

fetchDonuts();
setInterval(fetchVotes, 1000);
