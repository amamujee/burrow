# Fruit size audit — 23 September 2026

All 125 fruit cards now have a physical size, measured in centimetres along the longest fruit-body dimension. Length is used for elongated fruits; diameter for rounded or flattened examples. This is a one-dimensional comparison, not volume or weight.

Displayed values are deliberately approximate examples: editorial selections inside cited dimensions, rounded reference measurements, or named cultivar examples. They are not global species averages, maxima, or measurements of the photographed specimens. Many fruits overlap in size. Ties sort alphabetically. Size and weight references can describe different specimens.

Stems, leaves, crowns, projecting hairs and spines are excluded. Coconut includes its fibrous husk; cape gooseberry excludes its papery husk; the cashew apple excludes the attached nut. Each card retains its precise scope note in `scripts/data/fruits.json` and its generated profile.

Primary references include Purdue’s Morton monographs, NC State and Iowa State Extension, USDA, Australian botanical and conservation agencies, Kew, Info Flora, CIFOR, the University of São Paulo, published studies and the Hort16A patent. Existing fruit reference pages supply other botanical descriptions. Broad NC State size bands are identified as bands, not precise measurements. Blood orange uses the sweet-orange species range, and nectarine uses the peach species range.

The Morton giant-granadilla metric parenthesis conflicts with its inch length; the 8–12 inch range is explicitly converted using 2.54 cm/in. Jamun has a metric unit typo, and Owari satsuma has a conflicting width conversion; their inch dimensions are converted explicitly too. None of these transcription errors is silently treated as valid metric data.

Collection displays Example size and uses `size-cm` from the pack adapter; primary `weight-g` and all 65 original weight examples remain unchanged. Missing sizes would sort last, without falling back to weight. Photo bytes, image paths, IDs, difficulty and unlock identities remain unchanged.

The regression suite checks every source record, range containment, unit and displayed size; the full 125-card ordering, alphabetical ties, unknown-size fallback and a banana/orange counterexample to weight order; weight preservation; and the rendered collection on phone and tablet-sized viewports.

## Inventory

| Fruit | Example (cm) | Axis | Reference range (cm) | Source and scope |
| --- | ---: | --- | --- | --- |
| Sea Buckthorn | ~0.7 | diameter | 0.6–0.8 | [Reference](https://en.wikipedia.org/wiki/Sea_buckthorn). One rounded berry from the published 6–8 mm diameter range. |
| Lingonberry | ~0.8 | diameter | 0.6–1 | [Reference](https://en.wikipedia.org/wiki/Vaccinium_vitis-idaea). The source's 6–10 mm diameter converted to centimetres. |
| Salal Berry | ~0.8 | diameter | 0.6–1 | [Reference](https://en.wikipedia.org/wiki/Gaultheria_shallon). The source's 6–10 mm diameter converted to centimetres. |
| Blackcurrant | ~1 | diameter | 0.8–1.4 | [Reference](https://www.efloras.org/florataxon.aspx?flora_id=2&taxon_id=241000646). Flora of China gives 0.8–1 cm, occasionally 1.4 cm, for the rounded fruit; one berry is compared. |
| Blueberry | ~1 | diameter | 0.5–1.6 | [Reference](https://en.wikipedia.org/wiki/Blueberry). Diameter of one berry, excluding the crown; cultivars vary. |
| Cloudberry | ~1 | diameter | See scope note | [Reference](https://www.worldfloraonline.org/taxon/wfo-0001014280). Flora of China, reproduced by World Flora Online, describes the rounded aggregate fruit as about 1 cm across. |
| Redcurrant | ~1 | diameter | 0.8–1.2 | [Reference](https://en.wikipedia.org/wiki/Redcurrant). One berry, using the published 8–12 mm range; not an entire strig. |
| Serviceberry | ~1 | diameter | 0.5–1.5 | [Reference](https://en.wikipedia.org/wiki/Amelanchier_alnifolia). The source's 5–15 mm diameter converted to centimetres. |
| Cranberry | ~1.3 | diameter | See scope note | [Reference](https://plants.ces.ncsu.edu/plants/vaccinium-macrocarpon/). NC State describes a half-inch round fruit; 1.27 cm is rounded to 1.3 cm. This is one berry, not a cluster. |
| Riberry | ~1.3 | length | See scope note | [Reference](https://en.wikipedia.org/wiki/Syzygium_luehmannii). The reference gives fruit reaching 13 mm long; converted to 1.3 cm, excluding the stalk. |
| Strawberry Tree Fruit | ~1.5 | diameter | 0.7–2 | [Reference](https://en.wikipedia.org/wiki/Arbutus_unedo). The source's 7–20 mm diameter converted to centimetres. |
| Cape Gooseberry | ~1.6 | diameter | 1.25–2 | [Reference](https://hort.purdue.edu/newcrop/morton/cape_gooseberry.html). The berry alone, excluding its papery lantern-like husk. |
| Grumichama | ~1.6 | diameter | 1.25–2 | [Reference](https://hort.purdue.edu/newcrop/morton/grumichama.html). Across the flattened fruit body; the stalk and sepals are excluded. |
| Acerola | ~2 | diameter | 1.25–2.5 | [Reference](https://hort.purdue.edu/newcrop/morton/barbados_cherry.html). Across one whole lobed fruit, excluding the stalk. |
| Blackberry | ~2 | diameter | 1–3 | [Reference](https://agriculture.vic.gov.au/biosecurity/weeds/weeds-information/blackberry). Agriculture Victoria's blackberry species-group description gives a 1–3 cm fruit diameter; cultivars vary. |
| Gooseberry | ~2 | diameter | See scope note | [Reference](https://www.nzpcn.org.nz/flora/species/ribes-uva-crispa/). The New Zealand Plant Conservation Network describes berries reaching about 25 mm across; this is an illustrative 2 cm example. |
| Grape | ~2 | length | See scope note | [Reference](https://plants.ces.ncsu.edu/plants/vitis-vinifera/). NC State lists both fruit length and width below one inch (2.54 cm); 2 cm is an illustrative single-grape example, not a bunch. |
| Kakadu Plum | ~2 | length | See scope note | [Reference](https://en.wikipedia.org/wiki/Terminalia_ferdinandiana). The reference gives about 2 cm length and 1 cm width; the longer axis is used. |
| Longan | ~2 | diameter | 1.25–2.5 | [Reference](https://hort.purdue.edu/newcrop/morton/longan.html). Diameter of one globose fruit with its shell. |
| Miracle Fruit | ~2 | length | See scope note | [Reference](https://en.wikipedia.org/wiki/Synsepalum_dulcificum). The reference describes red fruits 2 cm long. |
| Olive | ~2 | length | 1–2.5 | [Reference](https://en.wikipedia.org/wiki/Olive). Whole ripe-fruit length, including the stone; cultivars can differ. |
| Raspberry | ~2 | length | See scope note | [Reference](https://plants.ces.ncsu.edu/plants/rubus-idaeus/). NC State lists fruit length and width below one inch (2.54 cm); this is an illustrative 2 cm whole aggregate fruit. |
| Sour Cherry | ~2 | diameter | See scope note | [Reference](https://plants.ces.ncsu.edu/plants/prunus-cerasus/). NC State describes round fruits with length and width below one inch (2.54 cm); 2 cm is an illustrative example, excluding the stalk. |
| Jujube | ~2.5 | length | 1.5–3 | [Reference](https://en.wikipedia.org/wiki/Jujube). Longest dimension of one oval jujube; excluding its stalk. |
| Mulberry | ~2.5 | diameter | See scope note | [Reference](https://en.wikipedia.org/wiki/Morus_nigra). The black-mulberry reference describes compound fruits about 2.5 cm across; other mulberry species differ. |
| Sweet Cherry | ~2.5 | diameter | 2–3 | [Reference](https://en.wikipedia.org/wiki/Prunus_avium). Diameter range for modern cultivated sweet cherries; the stalk is excluded. |
| Greengage | ~3 | diameter | 2–4 | [Reference](https://en.wikipedia.org/wiki/Greengage). Diameter of one round-oval greengage, excluding its stalk. |
| Jabuticaba | ~3 | diameter | 1.6–4 | [Reference](https://hort.purdue.edu/newcrop/morton/jaboticabas.html). Morton's range spans the main cultivated jabuticaba species, including M. cauliflora; it excludes tiny M. tenella. |
| Jamun | ~3 | length | 1.27–5.08 | [Reference](https://hort.purdue.edu/newcrop/morton/jambolan.html). The published 0.5–2 inch length is converted to centimetres; the page's 'm' in the metric parenthesis is a unit typo. |
| Quandong | ~3 | diameter | 2–4 | [Reference](https://en.wikipedia.org/wiki/Santalum_acuminatum). Diameter of the globose fruit, including its skin and stone. |
| Surinam Cherry | ~3 | diameter | 2–4 | [Reference](https://hort.purdue.edu/newcrop/morton/surinam_cherry.html). Across one flattened, ribbed fruit. |
| Marula | ~3.5 | length | 3–4 | [Reference](https://en.wikipedia.org/wiki/Sclerocarya_birrea). Longest dimension of an oval fruit; occasional 5 cm specimens are outside this example range. |
| Apricot | ~4 | diameter | 2.54–7.62 | [Reference](https://plants.ces.ncsu.edu/plants/prunus-armeniaca/). NC State places fruit length and width in its 1–3 inch band; 4 cm is an illustrative rounded fruit within that broad band. |
| Date | ~4 | length | 2.5–7.5 | [Reference](https://hort.purdue.edu/newcrop/morton/Date.html). One date fruit with its skin and stone, excluding the stalk. |
| Davidson's Plum | ~4 | length | 3.3–4.5 | [Reference](https://www.agriculture.gov.au/sites/default/files/documents/d-jerseyana.pdf). The national recovery plan for Davidsonia jerseyana gives length 33–45 mm, width 31–37 mm and depth 27–35 mm. |
| Indian Jujube | ~4 | length | See scope note | [Reference](https://hort.purdue.edu/newcrop/morton/indian_jujube.html). Morton describes wild fruit 1.25–2.5 cm long and cultivated fruit reaching 6.25 cm; 4 cm is an illustrative cultivated example. |
| Jocote | ~4 | length | 2.5–5 | [Reference](https://hort.purdue.edu/newcrop/morton/purple_mombin.html). Length of a whole purple-mombin fruit. |
| Key Lime | ~4 | diameter | 2.5–5 | [Reference](https://hort.purdue.edu/newcrop/morton/mexican_lime.html). Diameter of a rounded whole-fruit example. |
| Kumquat | ~4 | diameter | See scope note | [Reference](https://hort.purdue.edu/newcrop/morton/kumquat.html). Morton's rounded Meiwa example is about 4 cm across; other kumquat types can be more elongated. |
| Langsat | ~4 | diameter | 2.5–5 | [Reference](https://hort.purdue.edu/newcrop/morton/langsat.html). A rounded whole-fruit example; elongated market forms also occur. |
| Loquat | ~4 | length | 2.5–5 | [Reference](https://hort.purdue.edu/newcrop/morton/loquat.html). Length of one whole fruit, excluding the stalk. |
| Lychee | ~4 | length | See scope note | [Reference](https://hort.purdue.edu/newcrop/morton/lychee.html). Morton describes fruit about 4 cm long and 2.5 cm wide; the longer axis is used. |
| Medlar | ~4 | diameter | 3–8 | [Reference](https://en.wikipedia.org/wiki/Mespilus_germanica). A cultivated-fruit example; the persistent sepals are excluded. |
| Strawberry | ~4 | length | 2.5–6.5 | [Reference](https://www.infoflora.ch/fr/flore/fragaria-%C3%97ananassa.html). Info Flora gives 2.5–6.5 cm for the cultivated strawberry; the leafy calyx is excluded. |
| African Star Apple | ~4.5 | length | 3.41–5.53 | [Reference](https://cigrjournal.org/index.php/Ejounral/article/view/5797). A physical-properties study reports lengths 3.41–5.53 cm, widths 3.31–5.08 cm and thicknesses 2.93–4.73 cm; this example uses the length axis. |
| Amla | ~4.5 | diameter | See scope note | [Reference](https://hort.purdue.edu/newcrop/morton/emblic.html). Morton's Banarsi example is 4.5 cm wide and 4 cm long; the wider dimension is used. |
| Plum | ~4.5 | diameter | 2–7 | [Reference](https://en.wikipedia.org/wiki/Plum). A rounded cultivated-plum example; the catalog covers multiple plum species. |
| Rose Apple | ~4.5 | length | 4–5 | [Reference](https://hort.purdue.edu/newcrop/morton/rose_apple.html). Body length, excluding the leafy calyx. |
| Feijoa | ~5 | length | 4–6 | [Reference](https://hort.purdue.edu/newcrop/morton/feijoa.html). Length of the oval body, excluding the persistent sepals. |
| Fig | ~5 | length | 2.5–10 | [Reference](https://hort.purdue.edu/newcrop/morton/fig.html). Fruit length; the stalk is excluded. |
| Rambutan | ~5 | length | 3.4–8 | [Reference](https://hort.purdue.edu/newcrop/morton/rambutan.html). Fruit-body length; the flexible hairs are not added to the body measurement. |
| Wax Apple | ~5 | diameter | 4.5–5.4 | [Reference](https://hort.purdue.edu/newcrop/morton/java_apple.html). The source gives width 4.5–5.4 cm and length 3.4–5 cm; the widest axis is used. |
| Mangosteen | ~5.5 | diameter | 3.4–7.5 | [Reference](https://hort.purdue.edu/newcrop/morton/mangosteen.html). Diameter of the rounded body, including rind but excluding leafy sepals. |
| Satsuma | ~5.5 | diameter | 3.81–6.985 | [Reference](https://hort.purdue.edu/newcrop/morton/mandarin_orange.html). Morton's Owari satsuma is 1.5–2.75 inches wide and 1.5–2.5 inches tall. The wider axis is used; the inconsistent metric width conversion is replaced using 2.54 cm per inch. |
| Clementine | ~6 | length | 5–7 | [Reference](https://hort.purdue.edu/newcrop/morton/mandarin_orange.html). Morton's Clementine cultivar description gives height 5–7 cm and width 5–6.1 cm; the longer axis is used. |
| Cocona | ~6 | length | 2.5–10 | [Reference](https://hort.purdue.edu/newcrop/morton/cocona.html). Fruit-body length; a 6 cm example is selected from the broad shape and size range. |
| Kiwifruit | ~6 | length | See scope note | [Reference](https://hort.purdue.edu/newcrop/morton/kiwifruit_ars.html). Morton's fuzzy kiwifruit description reaches 6.25 cm long; this is a rounded 6 cm example. |
| Mandarin | ~6 | diameter | 5–6.25 | [Reference](https://hort.purdue.edu/newcrop/morton/mandarin_orange.html). Morton's Willow-leaf mandarin is 5–6.25 cm wide and 4.5–5.7 cm tall; the wider axis is used. |
| Naranjilla | ~6 | diameter | See scope note | [Reference](https://hort.purdue.edu/newcrop/morton/naranjilla_ars.html). Morton describes fruit reaching 6.25 cm across; this is a rounded 6 cm example, excluding the calyx. |
| Nectarine | ~6 | diameter | 5–7 | [Reference](https://en.wikipedia.org/wiki/Peach). Uses the peach species' usual cultivated diameter range; nectarines are smooth-skinned peach varieties, not a separate size class. |
| Passion Fruit | ~6 | diameter | 4–7.5 | [Reference](https://hort.purdue.edu/newcrop/morton/passionfruit.html). A rounded whole-fruit example, including its rind. |
| Peach | ~6 | diameter | 5–7 | [Reference](https://en.wikipedia.org/wiki/Peach). The reference's usual cultivated-fruit diameter; unusually small or large specimens are excluded from this example. |
| Persian Lime | ~6 | length | 5–7.5 | [Reference](https://hort.purdue.edu/newcrop/morton/tahiti_lime.html). The source gives height 5–7.5 cm and width 4–6.25 cm; the example follows the longer axis. |
| Pulasan | ~6 | length | 5–7.5 | [Reference](https://hort.purdue.edu/newcrop/morton/pulasan.html). Fruit-body length; projecting rind spines are not added. |
| Salak | ~6 | length | 5–7 | [Reference](https://www.cifor-icraf.org/publications/pdf_files/Books/ethnobiology/EthnobiologyHandbook.pdf). The CIFOR ethnobiology handbook gives fruit dimensions of 5–7 by 5 cm; the longer axis is used. |
| Santol | ~6 | diameter | 4–7.5 | [Reference](https://hort.purdue.edu/newcrop/morton/santol.html). Across a globose or flattened fruit, including its rind. |
| Tangerine | ~6.5 | diameter | 5.7–7.5 | [Reference](https://hort.purdue.edu/newcrop/morton/mandarin_orange.html). Morton's Dancy tangerine example has width 5.7–7.5 cm and height 4–5.4 cm; the wider dimension is used. |
| Abiu | ~7 | length | 4–10 | [Reference](https://hort.purdue.edu/newcrop/morton/abiu.html). Whole-fruit body length, including its short end tip. |
| Apple | ~7 | diameter | 2.5–12 | [Reference](https://en.wikipedia.org/wiki/Apple). A rounded apple example selected within the broad cultivar range, rather than an average for every apple. |
| Bilimbi | ~7 | length | 4–10 | [Reference](https://hort.purdue.edu/newcrop/morton/bilimbi.html). Fruit-body length, excluding the stalk. |
| Persimmon | ~7 | diameter | See scope note | [Reference](https://hort.purdue.edu/newcrop/morton/japanese_persimmon.html). Morton's Fuyu example is 7 cm wide and 5 cm tall; the wider dimension is used. |
| Prickly Pear | ~7 | length | 5–9 | [Reference](https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A1151735-2/general-information). Kew's description gives length 5–9 cm and diameter 3–6 cm; projecting spines are excluded. |
| Sweet Granadilla | ~7 | length | 6–7.5 | [Reference](https://hort.purdue.edu/newcrop/morton/sweet_granadilla.html). Length of the broad elliptical fruit body. |
| Ambarella | ~7.5 | length | 6.25–9 | [Reference](https://hort.purdue.edu/newcrop/morton/ambarella_ars.html). Fruit-body length, excluding the stalk. |
| Guava | ~7.5 | length | 5–10 | [Reference](https://hort.purdue.edu/newcrop/morton/guava.html). Whole-fruit body length, excluding the stalk and floral remnants. |
| Sapodilla | ~7.5 | diameter | 5–10 | [Reference](https://hort.purdue.edu/newcrop/morton/sapodilla.html). A round-fruited example from the published width range; elongated cultivars can have a longer axis. |
| Star Apple | ~7.5 | diameter | 5–10 | [Reference](https://hort.purdue.edu/newcrop/morton/star_apple.html). Across a rounded whole-fruit example, including rind. |
| Tamarillo | ~7.5 | length | 5–10 | [Reference](https://hort.purdue.edu/newcrop/morton/tree_tomato.html). Length of the egg-shaped fruit body, excluding the stalk. |
| White Sapote | ~7.5 | diameter | See scope note | [Reference](https://hort.purdue.edu/newcrop/morton/white_sapote.html). Morton's Coleman cultivar is oblate and reaches 7.5 cm across; this is a named cultivar example. |
| Golden Kiwifruit | ~7.9 | length | See scope note | [Reference](https://patents.google.com/patent/USPP11066P/en). The Hort16A patent gives fruit length 79.1 mm; rounded to 7.9 cm. This named cultivar example is not an average for all yellow-fleshed kiwifruit. |
| Blood Orange | ~8 | diameter | 6.5–9.5 | [Reference](https://hort.purdue.edu/newcrop/morton/orange.html). Uses the sweet-orange species diameter range; this is an illustrative blood-orange example, not a blood-cultivar measurement. |
| Cashew Apple | ~8 | length | 5–11.25 | [Reference](https://hort.purdue.edu/newcrop/morton/cashew_apple.html). The fleshy cashew apple only, excluding the attached nut and its shell. |
| Finger Lime | ~8 | length | See scope note | [Reference](https://en.wikipedia.org/wiki/Citrus_australasica). The botanical description gives about 8 cm for the elongated fruit; other varieties may be shorter. |
| Orange | ~8 | diameter | 6.5–9.5 | [Reference](https://hort.purdue.edu/newcrop/morton/orange.html). A rounded sweet-orange example; diameter is its longest body dimension. |
| Pepino | ~8 | length | See scope note | [Reference](https://hortflora.rbg.vic.gov.au/taxon/ad9e2080-5340-11e7-b82b-005056b0018f). Royal Botanic Gardens Victoria describes fruit reaching 10 cm long; 8 cm is an illustrative body-length example. |
| Quince | ~8 | length | See scope note | [Reference](https://landscapeplants.oregonstate.edu/plants/cydonia-oblonga). Oregon State's description gives fruit about 8 cm long; the stalk is excluded. |
| Safou | ~8 | length | 4–12 | [Reference](https://en.wikipedia.org/wiki/Dacryodes_edulis). Length of the elliptical whole fruit. |
| Sugar Apple | ~8 | length | 6–10 | [Reference](https://hort.purdue.edu/newcrop/morton/sugar_apple.html). Whole fruit body, including its knobbly rind. |
| Banana Passionfruit | ~8.5 | length | 5–12 | [Reference](https://hort.purdue.edu/newcrop/morton/banana_passion_fruit.html). Length of the elongated fruit body. |
| Asian Pear | ~9 | diameter | 7.62–10.16 | [Reference](https://plants.ces.ncsu.edu/plants/pyrus-pyrifolia/). NC State describes 3–4 inch fruit; this is a rounded Asian-pear example with the stalk excluded. |
| Black Sapote | ~9 | diameter | 5–12.5 | [Reference](https://hort.purdue.edu/newcrop/morton/black_sapote.html). Across the round or flattened fruit body, excluding sepals. |
| Lucuma | ~9 | length | 7.5–10 | [Reference](https://hort.purdue.edu/newcrop/morton/lucmo.html). Whole-fruit body length. |
| Pomegranate | ~9 | diameter | 6.25–12.5 | [Reference](https://hort.purdue.edu/newcrop/morton/pomegranate.html). Diameter of the rounded fruit body, excluding the calyx crown. |
| Wood Apple | ~9 | diameter | 5–12.5 | [Reference](https://hort.purdue.edu/newcrop/morton/wood-apple.html). A rounded example, including the woody shell. |
| Lemon | ~9.5 | length | 7–12 | [Reference](https://hort.purdue.edu/newcrop/morton/lemon.html). Whole-fruit length, including the end tip but excluding the stalk. |
| African Horned Melon | ~10 | length | 6–15 | [Reference](https://www.nparks.gov.sg/florafaunaweb/flora/7/1/7116). NParks gives body length 6–15 cm and width 3–6 cm; projecting horns are not added separately. |
| Atemoya | ~10 | length | See scope note | [Reference](https://hort.purdue.edu/newcrop/morton/atemoya.html). Morton describes fruit generally reaching 10 cm long; this example uses that stated length. |
| Canistel | ~10 | length | 7.5–12.5 | [Reference](https://hort.purdue.edu/newcrop/morton/canistel.html). Morton's main cultivated form; the much smaller palmeri form is excluded. |
| Dragon Fruit | ~10 | length | See scope note | [Reference](https://hort.purdue.edu/newcrop/morton/strawberry_pear_ars.html). Morton's white-fleshed pitaya example reaches 10 cm long; leafy scale tips are not added to the body measurement. |
| Pawpaw | ~10 | length | 5–15 | [Reference](https://en.wikipedia.org/wiki/Asimina_triloba). Length of one whole fruit, excluding the stalk. |
| Pear | ~10 | length | See scope note | [Reference](https://en.wikipedia.org/wiki/Pear). The reference describes cultivated pears reaching 18 cm long; 10 cm is an illustrative pear-shaped example, excluding the stalk. |
| Star Fruit | ~10 | length | 6.35–15 | [Reference](https://hort.purdue.edu/newcrop/morton/carambola.html). Length along the whole fruit, rather than across a star-shaped slice. |
| Tamarind | ~11 | length | 5.08–17.78 | [Reference](https://hort.purdue.edu/newcrop/morton/tamarind.html). One complete pod; the published 2–7 inch range is converted using 2.54 cm per inch. |
| Avocado | ~12 | length | 7.5–33 | [Reference](https://hort.purdue.edu/newcrop/morton/avocado_ars.html). The species has a very broad cultivar range; 12 cm is an illustrative example, not a species mean. |
| Bael | ~12 | diameter | 5–20 | [Reference](https://hort.purdue.edu/newcrop/morton/bael_fruit.html). A rounded example, including the woody shell; fruit form and size vary widely. |
| Mango | ~12 | length | 6.25–25 | [Reference](https://hort.purdue.edu/newcrop/morton/mango_ars.html). Whole-fruit length; 12 cm is an illustrative selection within a broad cultivar range. |
| Grapefruit | ~12.5 | diameter | 10–15 | [Reference](https://hort.purdue.edu/newcrop/morton/grapefruit.html). Diameter of a whole rounded grapefruit with its rind. |
| Cherimoya | ~15 | length | 10–20 | [Reference](https://hort.purdue.edu/newcrop/morton/cherimoya.html). Length of the whole conical or heart-shaped fruit. |
| Mamey Sapote | ~15 | length | 7.5–22.8 | [Reference](https://hort.purdue.edu/newcrop/morton/sapote_ars.html). Length of a whole fruit, including the skin. |
| Banana | ~18 | length | 6.4–30 | [Reference](https://hort.purdue.edu/newcrop/morton/banana.html). The broad banana range includes many cultivars; 18 cm is an illustrative dessert-banana length, with the peel and without the stalk. |
| Cantaloupe | ~18 | diameter | 12.7–25.4 | [Reference](https://yardandgarden.extension.iastate.edu/how-to/vegetable-harvest-guide). Iowa State's harvest guide lists muskmelon/cantaloupe at 5–10 inches diameter; converted to centimetres for a rounded example. |
| Honeydew Melon | ~18 | length | 15–22 | [Reference](https://en.wikipedia.org/wiki/Honeydew_(melon)). The longest body dimension of a round to slightly oval honeydew. |
| Baobab | ~20 | length | See scope note | [Reference](https://en.wikipedia.org/wiki/Adansonia_digitata). The reference describes baobab fruit reaching 25 cm long; this is an illustrative 20 cm whole pod with its shell. |
| Breadfruit | ~20 | length | 9–45 | [Reference](https://hort.purdue.edu/newcrop/morton/breadfruit.html). The reference covers many shapes and cultivars; this is a 20 cm example, not an average. |
| Cupuaçu | ~20 | length | 12–25 | [Reference](https://www.esalq.usp.br/d-plant/node/3268). The University of São Paulo description gives a fruit length of 12–25 cm, including the shell. |
| Pomelo | ~20 | diameter | 10–30 | [Reference](https://hort.purdue.edu/newcrop/morton/pummelo.html). A rounded pomelo example, including the thick rind. |
| Soursop | ~20 | length | 10–30 | [Reference](https://hort.purdue.edu/newcrop/morton/soursop.html). Fruit-body length; soft projecting spines are not added to the measurement. |
| Durian | ~22.5 | length | 15–30 | [Reference](https://hort.purdue.edu/newcrop/morton/durian_ars.html). Whole fruit-body length; projecting spines are not added separately. |
| Coconut | ~25 | length | 20–30 | [Reference](https://research.fs.usda.gov/download/treesearch/45147.pdf). USDA's whole-fruit length includes the fibrous outer husk; it is larger than the dehusked brown nut often sold in shops. |
| Giant Granadilla | ~25 | length | 20.32–30.48 | [Reference](https://hort.purdue.edu/newcrop/morton/giant_granadilla.html). The published 8–12 inch length is converted to centimetres; the page's conflicting 10–30 cm parenthesis is not used. |
| Papaya | ~25 | length | 15–50 | [Reference](https://hort.purdue.edu/newcrop/morton/papaya_ars.html). Cultivated fruit-body length; 25 cm is one illustrative example within a very broad range. |
| Pineapple | ~25 | length | See scope note | [Reference](https://hort.purdue.edu/newcrop/morton/pineapple.html). Morton describes fruit bodies reaching 30 cm or more; this 25 cm example excludes the leafy crown. |
| Plantain | ~25 | length | See scope note | [Reference](https://www.scielo.br/j/pab/a/jHQ7KkPmXKS3GW9bjCWmbTx/?format=pdf&lang=en). A Brazilian field study reports an average fruit length of 25 cm for its French plantain group; this is a study-specific example, including peel. |
| Watermelon | ~30 | diameter | 28–30 | [Reference](https://en.wikipedia.org/wiki/Watermelon). A rounded Melitopolski cultivar example; larger and more elongated watermelon cultivars also exist. |
| Jackfruit | ~50 | length | 20–90 | [Reference](https://hort.purdue.edu/newcrop/morton/jackfruit_ars.html). Whole compound fruit, including its rind, rather than one edible bulb. |
