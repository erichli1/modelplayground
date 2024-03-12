import { type ClassValue, clsx } from "clsx";
import { ForwardRefRenderFunction, forwardRef } from "react";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// forward refs
export function fr<T = HTMLElement, P = React.HTMLAttributes<T>>(
  component: ForwardRefRenderFunction<T, P>
) {
  const wrapped = forwardRef(component);
  wrapped.displayName = component.name;
  return wrapped;
}

// styled element
export function se<
  T = HTMLElement,
  P extends React.HTMLAttributes<T> = React.HTMLAttributes<T>
>(Tag: keyof React.ReactHTML, ...classNames: ClassValue[]) {
  const component = fr<T, P>(({ className, ...props }, ref) => (
    // @ts-expect-error Too complicated for TypeScript
    <Tag ref={ref} className={cn(...classNames, className)} {...props} />
  ));
  component.displayName = Tag[0].toUpperCase() + Tag.slice(1);
  return component;
}

export type PossibleBenchmarks = keyof typeof benchmarks;

export const benchmarks = {
  MMLU: {
    system:
      "You will be given a multiple-choice question with four possible answers corresponding to A, B, C, and D. Please answer the question with a single letter.",
    qa: [
      {
        q: `For which of these two scenarios does the main character (who uses I/me/my) do something clearly morally wrong, according to ordinary moral standards in the US as of 2020? Scenario 1 | I slammed on my breaks to miss the ball as it came in to the road. Scenario 2 | I taught my children to play the xylophone.\nA) Wrong, Wrong\nB) Wrong, Not wrong\nC) Not wrong, Wrong\nD) Not wrong, Not wrong`,
        a: `D`,
      },
      {
        q: `What is the structure of the United Nations Security Council?\nA) 5 permanent members with veto power, 10 rotating members with no veto power\nB) 5 permanent members and 10 rotating members, all with veto power\nC) 10 permanent members with veto power, and 5 rotating members without veto power\nD) 15 permanent members with veto power`,
        a: `A`,
      },
      {
        q: `Which common public relations tactic involves sending journalists on visits to appropriate locations?\nA) Media release\nB) Media tour\nC) Press room\nD) Promotional days/weeks`,
        a: `B`,
      },
      {
        q: `As of 2016, about what percentage of adults aged 18 years or older were overweight?\nA) 10%\nB) 20%\nC) 40%\nD) 80%`,
        a: `C`,
      },
      {
        q: `The Barkhausen criterion for an oscillator\nA) Loop gain should be unity\nB) Loop gain should be less than unity\nC) The phase of a feedback signal with respect to input should be 0° or 360°\nD) Both A and C`,
        a: `D`,
      },
      {
        q: `What is true for a type-Ia ("type one-a") supernova?\nA) This type occurs in binary systems.\nB) This type occurs in young galaxies.\nC) This type produces gamma-ray bursts.\nD) This type produces high amounts of X-rays.`,
        a: `A`,
      },
      {
        q: `_______ such as bitcoin are becoming increasingly mainstream and have a whole host of associated ethical implications, for example, they are______ and more ______. However, they have also been used to engage in _______.\nA) Cryptocurrencies, Expensive, Secure, Financial Crime\nB) Traditional currency, Cheap, Unsecure, Charitable giving\nC) Cryptocurrencies, Cheap, Secure, Financial crime\nD) Traditional currency, Expensive, Unsecure, Charitable giving`,
        a: `C`,
      },
      {
        q: `Which statement best explains the purpose of Hart's distinction between 'being obliged' and 'having an obligation'?\nA) It demonstrates the difference between the internal and the external aspect of a rule.\nB) It refutes the natural lawyer' view of the role of morality in law.\nC) It explains the nature of power-conferring rules.\nD) It illuminates the concept of a rule.`,
        a: `D`,
      },
      {
        q: `London dispersion forces are caused by\nA) temporary dipoles created by the position of electrons around the nuclei in a molecule\nB) the three-dimensional intermolecular bonding present in all covalent substances\nC) the uneven electron-to-proton ratio found on individual atoms of a molecule\nD) the electronegativity differences between the different atoms in a molecule`,
        a: `A`,
      },
      {
        q: `The quantum efficiency of a photon detector is 0.1. If 100 photons are sent into the detector, one after the other, the detector will detect photons\nA) an average of 10 times, with an rms deviation of about 4\nB) an average of 10 times, with an rms deviation of about 3\nC) an average of 10 times, with an rms deviation of about 1\nD) an average of 10 times, with an rms deviation of about 0.1`,
        a: `B`,
      },
      {
        q: `Which of the following statements expresses a relationship between aging and sexual functioning\nA) Aging is related to an increase in vaginal lubrication\nB) Aging is associated with an increase in the frequency and number of orgasmic contractions in both sexes\nC) There is no significant relationship between aging and sexual responses in either sex\nD) Aging is related to some loss of erectile rigidity in the male`,
        a: `D`,
      },
      {
        q: `This is a hierarchy of effects or sequential model used to explain how advertising works:\nA) ADD.\nB) AIDA.\nC) PESTLE.\nD) SWOT.`,
        a: `B`,
      },
      {
        q: `What is the term for a sub-optimal but acceptable outcome of negotiations between parties?\nA) Bargaining\nB) Satisficing\nC) Accepting\nD) Compromising`,
        a: `B`,
      },
      {
        q: `How many human polyomaviruses are known at present?\nA) 100\nB) 1\nC) 10\nD) unknown`,
        a: `A`,
      },
      {
        q: `Which State ordinarily exercises jurisdiction in respect of crimes committed on board vessels?\nA) The coastal State\nB) The flag State\nC) All States enjoy such jurisdiction\nD) The International Tribunal for the Law of the Sea`,
        a: `B`,
      },
      {
        q: `Suppose that an expansionary fiscal policy leads to a large increase in real output and a small increase in the price level. From this it can be inferred that\nA) inflation had already impacted the economy before the fiscal stimulus.\nB) the economy initially had some unemployed resources.\nC) aggregate supply decreased.\nD) aggregate demand is steeply sloped.`,
        a: `B`,
      },
      {
        q: `Unlike most other early civilizations, Minoan culture shows little evidence of:\nA) trade.\nB) warfare.\nC) the development of a common religion.\nD) conspicuous consumption by elites.`,
        a: `D`,
      },
      {
        q: `Find the degree for the given field extension Q(sqrt(2), sqrt(3), sqrt(18)) over Q.\nA) 0\nB) 4\nC) 2\nD) 6`,
        a: `B`,
      },
      {
        q: `The plates of a capacitor are charged to a potential difference of 5 V. If the capacitance is 2 mF, what is the charge on the positive plate?\nA) 0.005 C\nB) 0.01 C\nC) 0.02 C\nD) 0.5 C`,
        a: `B`,
      },
      {
        q: `Identify the conclusion of the following argument. It is hard not to verify in our peers the same weakened intelligence due to emotions that we observe in our everyday patients. The arrogance of our consciousness, which in general, belongs to the strongest defense mechanisms, blocks the unconscious complexes. Because of this, it is difficult to convince people of the unconscious, and in turn to teach them what their conscious knowledge contradicts. (Sigmund Freud, The Origin and Development of Psychoanalysis)\nA) It is hard not to verify in our peers the same weakened intelligence due to emotions that we observe in our everyday patients.\nB) The arrogance of our consciousness, which in general, belongs to the strongest defense mechanisms, blocks the unconscious complexes.\nC) Because of this, it is difficult to convince people of the unconscious, and in turn to teach them what their conscious knowledge contradicts.\nD) It is difficult to convince people of the unconscious, and in turn to teach them what their conscious knowledge contradicts.`,
        a: `D`,
      },
      {
        q: `A police officer carries out hundreds of traffic stops every year. When his supervisor is reviewing the officer’s records for the past year, he notices that the officer is equally likely to stop people of various genders, ages, and races. However, he is significantly more likely to write tickets for middle-aged white males with dark hair and eyes. When confronted with this fact, the officer truthfully states that he has no idea why that is, and that it must simply be a coincidence. Unbeknownst to the officer, this behavior is tied to the fact that these men look like his father, with whom he had an abusive relationship as a child. What psychological framework would directly address the unconscious bias in his behavior? \nA) Behaviorist\nB) Psychoanalytic\nC) Cognitive behavioral\nD) Humanistic`,
        a: `B`,
      },
      {
        q: `This question refers to the following information.
     "The far-reaching, the boundless future will be the era of American greatness. In its magnificent domain of space and time, the nation of many nations is destined to manifest to mankind the excellence of divine principles; to establish on earth the noblest temple ever dedicated to the worship of the Most High—the Sacred and the True. Its floor shall be a hemisphere—its roof the firmament of the star-studded heavens, and its congregation a Union of many Republics, comprising hundreds of happy millions, calling, owning no man master, but governed by God's natural and moral law of equality, the law of brotherhood—of 'peace and good will amongst men.'"
     John L. O'Sullivan, "The Great Nation of Futurity," 1839
     By what means did the United States take possession of the Oregon Territory?\nA) The United States was granted the territory in a postwar treaty with France.\nB) The United States bought it from the Native Americans who lived there.\nC) U.S. settlers were the first to arrive in the region; they claimed it for their country.\nD) Great Britain ceded it to the United States as part of a negotiated treaty.`,
        a: `D`,
      },
      {
        q: ` Just war theory's principle of military necessity belongs to\nA) jus in bello.\nB) jus ad bellum.\nC) moral nihilism.\nD) all of the above`,
        a: `A`,
      },
      {
        q: `This question refers to the following information.
     In order to make the title of this discourse generally intelligible, I have translated the term "Protoplasm," which is the scientific name of the substance of which I am about to speak, by the words "the physical basis of life." I suppose that, to many, the idea that there is such a thing as a physical basis, or matter, of life may be novel—so widely spread is the conception of life as something which works through matter. … Thus the matter of life, so far as we know it (and we have no right to speculate on any other), breaks up, in consequence of that continual death which is the condition of its manifesting vitality, into carbonic acid, water, and nitrogenous compounds, which certainly possess no properties but those of ordinary matter.
     Thomas Henry Huxley, "The Physical Basis of Life," 1868
     From the passage, one may infer that Huxley argued that "life" was\nA) a force that works through matter\nB) essentially a philosophical notion\nC) merely a property of a certain kind of matter\nD) a supernatural phenomenon`,
        a: `C`,
      },
      {
        q: `What size of cannula would you use in a patient who needed a rapid blood transfusion (as of 2020 medical knowledge)?\nA) 18 gauge.\nB) 20 gauge.\nC) 22 gauge.\nD) 24 gauge.`,
        a: `A`,
      },
      {
        q: ` What can murtis be translated as?\nA) Offerings\nB) Prayers\nC) Apparitions\nD) Idols`,
        a: `D`,
      },
      {
        q: `Marginal revenue equals marginal cost at the point where\nA) total revenue is greater than total cost at its greatest distance\nB) total revenue is equal to total cost\nC) marginal product is at its highest point\nD) total product is at its highest point`,
        a: `A`,
      },
      {
        q: `One afternoon, a pilot was flying a small airplane when it suddenly ran out of gas. As he was coming in for an emergency landing, the plane crossed into a neighboring state at a very low altitude. At this time, a 9-year-old boy was walking to school when he was struck and injured by an object, which may have fallen from the plane. In federal court, a negligence suit was brought against the pilot by the father of the boy for his son. Accompanied by his father, the boy had visited an attorney for preliminary discussions regarding the case. However, the father did not retain the attorney to represent his son in the lawsuit. Instead, the father hired another lawyer to handle the case. At trial, the pilot's attorney calls the consulting attorney to testify what the boy had said to him regarding his physical condition during the consultation that the attorney had had with the boy and his father. The attorney's testimony is\nA) admissible, because the attorney-client privilege was waived by the filing of the lawsuit.\nB) admissible, because there is no privilege of confidentiality when a person other than the client is present at the attorney-client consultation.\nC) inadmissible, because the attorney-client privilege prevents such a breach of confidential communications.\nD) inadmissible, because it was a statement of physical condition not made for the purpose of obtaining medical treatment.`,
        a: `C`,
      },
      {
        q: `The study of older adults and aging is referred to as\nA) Gerontology\nB) Geropsychiatry\nC) Geriatrics\nD) Gero-education`,
        a: `A`,
      },
      {
        q: `In a Robertsonian translocation fusion occurs at the:\nA) telomeres.\nB) centromeres.\nC) histones.\nD) ends of the long arms.`,
        a: `B`,
      },
      {
        q: `The main factor preventing subsistence economies from advancing economically is the lack of\nA) a currency.\nB) a well-connected transportation infrastructure.\nC) government activity.\nD) a banking service.`,
        a: `B`,
      },
      {
        q: `Which of the following best describes the balance the Supreme Court has struck between the establishment clause and the free-exercise clause?\nA) Freedom of speech is protected except in certain situations, such as yelling "fire" in a crowded theater.\nB) Once a church has been recognized by the federal government, its tax-exempt status can never be revoked.\nC) Once Congress has created an administrative agency, that agency can be dissolved only by a constitutional amendment.\nD) State-sponsored prayer during school hours is prohibited, but voluntary prayer by student groups before school is allowed.`,
        a: `D`,
      },
      {
        q: `A lesion causing compression of the facial nerve at the stylomastoid foramen will cause ipsilateral\nA) paralysis of the facial muscles.\nB) paralysis of the facial muscles and loss of taste.\nC) paralysis of the facial muscles, loss of taste and lacrimation.\nD) paralysis of the facial muscles, loss of taste, lacrimation and decreased salivation.`,
        a: `A`,
      },
      {
        q: `Mass-society theory suggests that:\nA) the content of the media is determined by market forces\nB) the subordinate classes are dominated by the ideology of the ruling class\nC) the media manipulate 'the masses' as vulnerable, passive consumers\nD) audiences make selective interpretations of media messages`,
        a: `C`,
      },
      {
        q: `A valid disjunctive syllogism has a major premise that:\nA) includes two or more alternatives\nB) classifies subjects\nC) affirms the antecedent or denies the consequent\nD) leads to a valid conclusion`,
        a: `A`,
      },
      {
        q: `Let x = 1. What is x << 3 in Python 3?\nA) 1\nB) 3\nC) 8\nD) 16`,
        a: `C`,
      },
      {
        q: `An important source of information on the credit rating of retail businesses is\nA) the Retail Merchants Association\nB) the local chamber of commerce\nC) Dun & Bradstreet, Inc.\nD) the United States Retail Credit Association`,
        a: `C`,
      },
      {
        q: `This question refers to the following information.
     No task is more urgent than that of preserving peace. Without peace our independence means little. The rehabilitation and upbuilding of our countries will have little meaning. Our revolutions will not be allowed to run their course. What can we do? We can do much! We can inject the voice of reason into world affairs. We can mobilize all the spiritual, all the moral, all the political strength of Asia and Africa on the side of peace. Yes, we! We, the peoples of Asia and Africa, 1.4 billion strong.
     Indonesian leader Sukarno, keynote address to the Bandung Conference, 1955
     The passage above is most associated with which of the following developments?\nA) The formation of the non-aligned movement\nB) Global disarmanent and nuclear non-proliferation\nC) The Green Revolution in agriculture\nD) Mobilization of pan-Asian ideology`,
        a: `A`,
      },
      {
        q: `A 67-year-old woman comes to the physician for a follow-up examination. She had a pulmonary embolism and required treatment in the hospital for 3 weeks. She had a retroperitoneal hemorrhage; anticoagulant therapy was temporarily discontinued, and she underwent placement of an inferior vena cava (IVC) filter. She had a hematoma that was resolving on discharge from the hospital 2 weeks ago. Today, she says she has had a persistent sensation of tingling and numbness of her left thigh that she did not report in the hospital because she thought it would go away; the sensation has improved somewhat during the past week. Her only medication is warfarin. Vital signs are within normal limits. Examination of the skin shows no abnormalities. Muscle strength is normal. Sensation to light touch is decreased over a 5 x 5-cm area on the lateral aspect of the left anterior thigh. Which of the following is the most likely cause of this patient's decreased sensation?\nA) Cerebral infarction during the hospitalization\nB) Complication of the IVC filter placement\nC) Compression of the lateral femoral cutaneous nerve\nD) Hematoma of the left thigh`,
        a: `C`,
      },
      {
        q: `In a population of giraffes, an environmental change occurs that favors individuals that are tallest. As a result, more of the taller individuals are able to obtain nutrients and survive to pass along their genetic information. This is an example of\nA) directional selection.\nB) stabilizing selection.\nC) sexual selection.\nD) disruptive selection.`,
        a: `A`,
      },
      {
        q: `The weight of an aspirin tablet is 300 milligrams according to the bottle label. An FDA investigator weighs a simple random sample of seven tablets, obtains weights of 299, 300, 305, 302, 299, 301, and 303, and runs a hypothesis test of the manufacturer's claim. Which of the following gives the P-value of this test?\nA) P(t > 1.54) with df = 6\nB) 2P(t > 1.54) with df = 6\nC) P(t > 1.54) with df = 7\nD) 2P(t > 1.54) with df = 7`,
        a: `B`,
      },
      {
        q: `The rate, r, of a zero-order chemical reaction A → B can be expressed as which of the following?\nA) r = k ln[A]\nB) r = k [A]^2\nC) r = k [A]\nD) r = k`,
        a: `D`,
      },
      {
        q: `Which foods tend to be consumed in lower quantities in Wales and Scotland (as of 2020)?
     \nA) Meat\nB) Confectionary\nC) Fruits and vegetables\nD) Potatoes`,
        a: `C`,
      },
      {
        q: `Which one of the following is the most appropriate definition of a 99% confidence interval?\nA) 99% of the time in repeated samples, the interval would contain the true value of the parameter\nB) 99% of the time in repeated samples, the interval would contain the estimated value of the parameter\nC) 99% of the time in repeated samples, the null hypothesis will be rejected\nD) 99% of the time in repeated samples, the null hypothesis will not be rejected when it was false`,
        a: `A`,
      },
      {
        q: `Which of the following methods of detecting breast cancer involves exposure to radiation?\nA) Needle aspiration\nB) Mammography\nC) Mastectomy\nD) Lumpectomy`,
        a: `B`,
      },
      {
        q: `Which of these principles is not an element of the responsibility to protect?\nA) The responsibility to prevent.\nB) The responsibility to react.\nC) The responsibility to remain sovereign.\nD) The responsibility to rebuild.`,
        a: `C`,
      },
      {
        q: `Aesthetics deals with objects that are_____.\nA) essential to our existence\nB) unimportant to most people\nC) not essential to our existence\nD) rarely viewed`,
        a: `C`,
      },
      {
        q: `What is the value of p in 24 = 2p?\nA) p = 4\nB) p = 8\nC) p = 12\nD) p = 24`,
        a: `C`,
      },
      {
        q: `Based on the characteristic population curves that result from plotting population growth of a species, the most effective means of controlling the mosquito population is to\nA) maintain the population at a point corresponding to the midpoint of its logistic curve\nB) opt for zero population control once the K value of the curve has been reached\nC) reduce the carrying capacity cif the environment to lower the K value\nD) increase the mortality rate`,
        a: `C`,
      },
      {
        q: `The access matrix approach to protection has the difficulty that\nA) the matrix, if stored directly, is large and can be clumsy to manage\nB) it is not capable of expressing complex protection requirements\nC) deciding whether a process has access to a resource is undecidable\nD) there is no way to express who has rights to change the access matrix itself`,
        a: `A`,
      },
      {
        q: `Statement 1| Linear regression estimator has the smallest variance among all unbiased estimators. Statement 2| The coefficients α assigned to the classifiers assembled by AdaBoost are always non-negative.\nA) True, True\nB) False, False\nC) True, False\nD) False, True`,
        a: `D`,
      },
      {
        q: `You bought a limousine for $98,000 and are planning to rent it for weddings, ceremonies and parties at $245 per hour. If you estimate the car will be hired for 2 hours a day on average, with daily costs at about $50, what is the estimated yearly yield on your investment if you work all year round, i.e. every day of the year, including any festivities and weekends?\nA) 164%\nB) 1.64%\nC) 0.45%\nD) 183%`,
        a: `A`,
      },
      {
        q: `Let k be the number of real solutions of the equation e^x + x - 2 = 0 in the interval [0, 1], and let n be the number of real solutions that are not in [0, 1]. Which of the following is true?\nA) k = 0 and n = 1\nB) k = 1 and n = 0\nC) k = n = 1\nD) k > 1`,
        a: `B`,
      },
      {
        q: `If a pentagon P with vertices at (– 2, – 4), (– 4, 1), (–1, 4), (2, 4), and (3, 0) is reflected across the line y = x to get a new pentagon, P’, then one of the vertices of P’ is\nA) (0, – 3)\nB) (4, 1)\nC) (2, 2)\nD) (– 4, –2)`,
        a: `D`,
      },
      {
        q: `Nearsightedness results from\nA) too much curvature of the cornea and lens\nB) too little curvature of the cornea and lens\nC) too much curvature of the iris and lens\nD) too little curvature of the iris and lens`,
        a: `A`,
      },
      {
        q: `A 10-N force at an angle 45° above the horizontal has a horizontal component of about\nA) 7 N\nB) 5 N\nC) 10 N\nD) 12 N`,
        a: `A`,
      },
      {
        q: `Which of the following styles of fuzzer is more likely to explore paths covering every line of code in the following program?\nA) Generational\nB) Blackbox\nC) Whitebox\nD) Mutation-based`,
        a: `C`,
      },
    ],
  },
};
