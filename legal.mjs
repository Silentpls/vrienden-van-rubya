/* Juridische pagina's: privacy, toegankelijkheid, 404 + colofon (BW 3:15d). Placeholders: zie README. */
export default ({ add, pages, btn, IBAN }) => {
  const prose = (eyebrow, h1, body) => `
<section class="section prose-sec"><div class="narrow prose"><span class="eyebrow">${eyebrow}</span><h1 style="margin:.8rem 0 1.4rem">${h1}</h1>${body}</div></section>`;

  pages.find(p => p.file === 'contact.html').body += `
<section class="section bg-sand" id="colofon"><div class="container split top">
  <div data-reveal><span class="eyebrow">Colofon</span><h2 style="margin:.7rem 0 1.2rem">Wie zijn wij?</h2><p class="lead">Stichting Vrienden van Rubya is een ANBI en bestaat alleen uit vrijwilligers.</p></div>
  <dl class="colofon" data-reveal>
    <div><dt>Naam</dt><dd>Stichting Vrienden van Rubya</dd></div>
    <div><dt>Vestigingsadres</dt><dd>Echobos 21, 1358 EG Almere</dd></div>
    <div><dt>E-mail</dt><dd><a href="mailto:info@vriendenvanrubya.org">info@vriendenvanrubya.org</a></dd></div>
    <div><dt>Telefoon</dt><dd>[TELEFOONNUMMER]</dd></div>
    <div><dt>KvK-nummer</dt><dd>[KVK-NUMMER]</dd></div>
    <div><dt>RSIN (ANBI)</dt><dd>807248496</dd></div>
    <div><dt>Btw-nummer</dt><dd>[BTW-NUMMER]</dd></div>
    <div><dt>Bankrekening</dt><dd>${IBAN} (BIC ABNANL2A)</dd></div>
    <div><dt>Beroepsregistratie</dt><dd>Niet van toepassing</dd></div>
  </dl>
</div></section>`;

  add({ file: 'privacy.html', title: 'Privacyverklaring', cur: 'privacy.html', desc: 'Hoe Stichting Vrienden van Rubya omgaat met uw persoonsgegevens.',
    body: prose('Privacy', 'Privacyverklaring', `
<p class="lead">Wij gaan zorgvuldig om met uw gegevens en vragen alleen wat nodig is. Laatst bijgewerkt: 21 oktober 2026.</p>
<h2>Wie is verantwoordelijk?</h2>
<p>Stichting Vrienden van Rubya, Echobos 21, 1358 EG Almere, KvK [KVK-NUMMER]. E-mail: <a href="mailto:info@vriendenvanrubya.org">info@vriendenvanrubya.org</a>. Wij hebben geen functionaris voor gegevensbescherming. Vragen over privacy stelt u aan ditzelfde adres.</p>
<h2>Welke gegevens, waarom en hoe lang?</h2>
<div class="tbl" role="region" aria-label="Overzicht gegevensverwerking" tabindex="0"><table>
<thead><tr><th scope="col">Situatie</th><th scope="col">Gegevens</th><th scope="col">Doel</th><th scope="col">Grondslag</th><th scope="col">Bewaartermijn</th></tr></thead>
<tbody>
<tr><th scope="row">Contactformulier</th><td>Naam, e-mailadres, uw bericht</td><td>Uw vraag beantwoorden</td><td>Toestemming (art. 6 lid 1 sub a AVG)</td><td>Maximaal 12 maanden na afhandeling</td></tr>
<tr><th scope="row">Nieuwsbrief</th><td>E-mailadres</td><td>Jaarlijks de nieuwsbrief sturen</td><td>Toestemming (art. 6 lid 1 sub a AVG)</td><td>Tot u zich afmeldt</td></tr>
<tr><th scope="row">Giften per bank</th><td>Naam, rekeningnummer en eventuele omschrijving (via uw bank)</td><td>Gift verwerken en administratie voeren</td><td>Wettelijke verplichting (art. 6 lid 1 sub c AVG)</td><td>7 jaar (fiscale bewaarplicht)</td></tr>
<tr><th scope="row">Websitebezoek</th><td>IP-adres en browsergegevens in serverlogs van de hostingpartij</td><td>Beveiliging en storingen oplossen</td><td>Gerechtvaardigd belang (art. 6 lid 1 sub f AVG)</td><td>Maximaal 30 dagen, bij de hostingpartij</td></tr>
</tbody></table></div>
<h2>Hoe werken de formulieren?</h2>
<p>De formulieren op deze site openen uw eigen e-mailprogramma met een kant-en-klaar bericht aan ons. De site slaat zelf niets op. Uw bericht gaat pas op pad als u het zelf verstuurt. Vul alleen in wat nodig is. Het vinkje voor de privacyverklaring staat nooit vooraf aan.</p>
<h2>Cookies en externe diensten</h2>
<p>Deze site plaatst <strong>geen cookies</strong>, gebruikt geen analyse- of marketingdiensten en slaat niets op in uw browser. Lettertypen en afbeeldingen komen van onze eigen server. Er worden geen kaarten, video's of scripts van derden geladen, dus uw IP-adres gaat niet naar Google of anderen. Daarom is geen cookiebanner nodig. Gaan wij dit ooit wel gebruiken, dan vragen wij eerst uw toestemming.</p>
<h2>Delen met derden</h2>
<p>Wij verkopen geen gegevens. Wij delen alleen met partijen die voor ons werken (hosting, e-mail), op basis van een verwerkersovereenkomst, of als de wet dat eist.</p>
<h2>Uw rechten</h2>
<p>U mag uw gegevens inzien, laten verbeteren of laten verwijderen, de verwerking laten beperken, bezwaar maken en uw gegevens laten overdragen. Heeft u toestemming gegeven, dan trekt u die op elk moment weer in. Mail ons; wij reageren binnen een maand. Afmelden voor de nieuwsbrief kan via de afmeldlink onder elke nieuwsbrief of met een mail aan ons.</p>
<h2>Klacht?</h2>
<p>Komen wij er samen niet uit, dan kunt u een klacht indienen bij de <a href="https://autoriteitpersoonsgegevens.nl/nl/contact-met-de-autoriteit-persoonsgegevens/tip-ons" rel="noopener">Autoriteit Persoonsgegevens</a>.</p>`) });

  add({ file: 'toegankelijkheid.html', title: 'Toegankelijkheidsverklaring', cur: 'toegankelijkheid.html', desc: 'Toegankelijkheidsverklaring van Stichting Vrienden van Rubya: conformiteit met WCAG 2.1 AA, bekende beperkingen en contact.',
    body: prose('Toegankelijkheid', 'Toegankelijkheidsverklaring', `
<p class="lead">Onze website moet voor iedereen te gebruiken zijn. Laatst bijgewerkt: 21 oktober 2026.</p>
<h2>Conformiteit</h2>
<p>Wij streven naar WCAG 2.1 niveau AA (de basis van norm EN 301 549). Op basis van geautomatiseerde tests (axe-core) en eigen controle voldoet de site hier naar ons oordeel aan, met de beperkingen hieronder. Een onafhankelijke audit heeft nog niet plaatsgevonden.</p>
<h2>Wat is geregeld</h2>
<ul><li>Volledig te bedienen met het toetsenbord, met zichtbare focus en een link "Naar de inhoud".</li><li>Logische kopstructuur, alt-teksten bij foto's en labels bij alle formuliervelden.</li><li>Voldoende kleurcontrast en knoppen van minimaal 44 bij 44 pixels.</li><li>Animaties gaan uit of worden minimaal als uw systeem "minder beweging" vraagt.</li><li>Werkt van telefoon tot breed scherm.</li></ul>
<h2>Bekende beperkingen</h2>
<ul><li>De rapporten en nieuwsbrieven zijn pdf-bestanden die niet allemaal volledig toegankelijk zijn. Wilt u er een in een andere vorm? Mail ons.</li><li>De landkaart van Tanzania is een geanimeerde illustratie. De inhoud staat ook als tekst op de pagina.</li><li>Sommige oudere foto's hebben een lage resolutie.</li></ul>
<h2>Probleem gemeld of hulp nodig?</h2>
<p>Loopt u ergens tegenaan? Mail <a href="mailto:info@vriendenvanrubya.org">info@vriendenvanrubya.org</a> of schrijf naar Echobos 21, 1358 EG Almere. Wij reageren binnen vijf werkdagen.</p>`) });

  add({ file: '404.html', title: 'Pagina niet gevonden', cur: '404.html', desc: 'Deze pagina bestaat niet.',
    body: prose('404', 'Deze pagina bestaat niet', `<p class="lead">Misschien is de link verouderd. Ga terug naar de startpagina of naar de pagina waar u uw gift kunt doen.</p><div class="hero-cta" style="margin-top:1.6rem">${btn('index.html', 'Naar de startpagina')}${btn('doneren.html', 'Doneren', 'btn-ghost')}</div>`) });
};
