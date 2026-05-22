import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useForm, Controller, useWatch, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarDays, Upload, User, X, ZoomIn, ZoomOut } from 'lucide-react';
import { format } from 'date-fns';
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { PortalSelect } from '../PortalSelect';
import type { EnrollmentStep1Values } from '../../../@types';

// ─── Phone formatter ─────────────────────────────────────────────────────────

function formatPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  mrn: z.string().min(1, 'MRN is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.string().min(1, 'Gender is required'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().regex(/^\(\d{3}\) \d{3}-\d{4}$/, 'Enter a valid 10-digit phone number'),
  profilePicture: z.string().optional().default(''),
  zipCode: z.string().min(1, 'ZIP code is required'),
  country: z.string().min(1, 'Country is required'),
  state: z.string().min(1, 'State is required'),
  city: z.string().min(1, 'City is required'),
  addressLine1: z.string().min(1, 'Address line 1 is required'),
  addressLine2: z.string().optional().default(''),
});

// ─── ZIP → Location lookup (US only) ─────────────────────────────────────────

const ZIP_TO_LOCATION: Record<string, { state: string; city: string }> = {
  '10001': { state: 'New York', city: 'New York City' },
  '10002': { state: 'New York', city: 'New York City' },
  '14601': { state: 'New York', city: 'Rochester' },
  '14201': { state: 'New York', city: 'Buffalo' },
  '12201': { state: 'New York', city: 'Albany' },
  '60601': { state: 'Illinois', city: 'Chicago' },
  '60602': { state: 'Illinois', city: 'Chicago' },
  '62701': { state: 'Illinois', city: 'Springfield' },
  '90001': { state: 'California', city: 'Los Angeles' },
  '90210': { state: 'California', city: 'Los Angeles' },
  '94101': { state: 'California', city: 'San Francisco' },
  '94102': { state: 'California', city: 'San Francisco' },
  '92101': { state: 'California', city: 'San Diego' },
  '95101': { state: 'California', city: 'San Jose' },
  '77001': { state: 'Texas', city: 'Houston' },
  '77002': { state: 'Texas', city: 'Houston' },
  '78201': { state: 'Texas', city: 'San Antonio' },
  '75201': { state: 'Texas', city: 'Dallas' },
  '73301': { state: 'Texas', city: 'Austin' },
  '76101': { state: 'Texas', city: 'Fort Worth' },
  '33101': { state: 'Florida', city: 'Miami' },
  '32801': { state: 'Florida', city: 'Orlando' },
  '33601': { state: 'Florida', city: 'Tampa' },
  '32201': { state: 'Florida', city: 'Jacksonville' },
  '33901': { state: 'Florida', city: 'Naples' },
  '30301': { state: 'Georgia', city: 'Atlanta' },
  '30901': { state: 'Georgia', city: 'Augusta' },
  '31401': { state: 'Georgia', city: 'Savannah' },
  '02101': { state: 'Massachusetts', city: 'Boston' },
  '01101': { state: 'Massachusetts', city: 'Springfield' },
  '19101': { state: 'Pennsylvania', city: 'Philadelphia' },
  '15201': { state: 'Pennsylvania', city: 'Pittsburgh' },
  '17101': { state: 'Pennsylvania', city: 'Harrisburg' },
  '48201': { state: 'Michigan', city: 'Detroit' },
  '49501': { state: 'Michigan', city: 'Grand Rapids' },
  '48901': { state: 'Michigan', city: 'Lansing' },
  '98101': { state: 'Washington', city: 'Seattle' },
  '98401': { state: 'Washington', city: 'Tacoma' },
  '99201': { state: 'Washington', city: 'Spokane' },
  '80201': { state: 'Colorado', city: 'Denver' },
  '80901': { state: 'Colorado', city: 'Colorado Springs' },
  '80521': { state: 'Colorado', city: 'Fort Collins' },
  '85001': { state: 'Arizona', city: 'Phoenix' },
  '85701': { state: 'Arizona', city: 'Tucson' },
  '85224': { state: 'Arizona', city: 'Chandler' },
  '97201': { state: 'Oregon', city: 'Portland' },
  '97301': { state: 'Oregon', city: 'Salem' },
  '89101': { state: 'Nevada', city: 'Las Vegas' },
  '89501': { state: 'Nevada', city: 'Reno' },
  '55401': { state: 'Minnesota', city: 'Minneapolis' },
  '55101': { state: 'Minnesota', city: 'Saint Paul' },
  '55901': { state: 'Minnesota', city: 'Rochester' },
  '53201': { state: 'Wisconsin', city: 'Milwaukee' },
  '53701': { state: 'Wisconsin', city: 'Madison' },
  '54301': { state: 'Wisconsin', city: 'Green Bay' },
  '63101': { state: 'Missouri', city: 'Saint Louis' },
  '64101': { state: 'Missouri', city: 'Kansas City' },
  '65801': { state: 'Missouri', city: 'Springfield' },
  '84101': { state: 'Utah', city: 'Salt Lake City' },
  '84601': { state: 'Utah', city: 'Provo' },
  '73101': { state: 'Oklahoma', city: 'Oklahoma City' },
  '74101': { state: 'Oklahoma', city: 'Tulsa' },
  '87101': { state: 'New Mexico', city: 'Albuquerque' },
  '87501': { state: 'New Mexico', city: 'Santa Fe' },
  '27601': { state: 'North Carolina', city: 'Raleigh' },
  '28201': { state: 'North Carolina', city: 'Charlotte' },
  '27401': { state: 'North Carolina', city: 'Greensboro' },
  '29201': { state: 'South Carolina', city: 'Columbia' },
  '29401': { state: 'South Carolina', city: 'Charleston' },
  '37201': { state: 'Tennessee', city: 'Nashville' },
  '38101': { state: 'Tennessee', city: 'Memphis' },
  '37901': { state: 'Tennessee', city: 'Knoxville' },
  '40201': { state: 'Kentucky', city: 'Louisville' },
  '40501': { state: 'Kentucky', city: 'Lexington' },
  '43201': { state: 'Ohio', city: 'Columbus' },
  '44101': { state: 'Ohio', city: 'Cleveland' },
  '45201': { state: 'Ohio', city: 'Cincinnati' },
  '44301': { state: 'Ohio', city: 'Akron' },
  '46201': { state: 'Indiana', city: 'Indianapolis' },
  '46801': { state: 'Indiana', city: 'Fort Wayne' },
  '68101': { state: 'Nebraska', city: 'Omaha' },
  '68501': { state: 'Nebraska', city: 'Lincoln' },
  '66101': { state: 'Kansas', city: 'Kansas City' },
  '67201': { state: 'Kansas', city: 'Wichita' },
  '50301': { state: 'Iowa', city: 'Des Moines' },
  '52401': { state: 'Iowa', city: 'Cedar Rapids' },
  '57101': { state: 'South Dakota', city: 'Sioux Falls' },
  '58101': { state: 'North Dakota', city: 'Fargo' },
  '58501': { state: 'North Dakota', city: 'Bismarck' },
  '59101': { state: 'Montana', city: 'Billings' },
  '59801': { state: 'Montana', city: 'Missoula' },
  '83701': { state: 'Idaho', city: 'Boise' },
  '82001': { state: 'Wyoming', city: 'Cheyenne' },
  '82601': { state: 'Wyoming', city: 'Casper' },
  '70801': { state: 'Louisiana', city: 'Baton Rouge' },
  '70112': { state: 'Louisiana', city: 'New Orleans' },
  '71101': { state: 'Louisiana', city: 'Shreveport' },
  '39201': { state: 'Mississippi', city: 'Jackson' },
  '39501': { state: 'Mississippi', city: 'Biloxi' },
  '35201': { state: 'Alabama', city: 'Birmingham' },
  '36101': { state: 'Alabama', city: 'Montgomery' },
  '35801': { state: 'Alabama', city: 'Huntsville' },
  '72201': { state: 'Arkansas', city: 'Little Rock' },
  '72701': { state: 'Arkansas', city: 'Fayetteville' },
  '21201': { state: 'Maryland', city: 'Baltimore' },
  '21401': { state: 'Maryland', city: 'Annapolis' },
  '20001': { state: 'District of Columbia', city: 'Washington' },
  '20002': { state: 'District of Columbia', city: 'Washington' },
  '22201': { state: 'Virginia', city: 'Arlington' },
  '23201': { state: 'Virginia', city: 'Richmond' },
  '23451': { state: 'Virginia', city: 'Virginia Beach' },
  '25301': { state: 'West Virginia', city: 'Charleston' },
  '26501': { state: 'West Virginia', city: 'Morgantown' },
  '06101': { state: 'Connecticut', city: 'Hartford' },
  '06901': { state: 'Connecticut', city: 'Stamford' },
  '06601': { state: 'Connecticut', city: 'Bridgeport' },
  '02901': { state: 'Rhode Island', city: 'Providence' },
  '03101': { state: 'New Hampshire', city: 'Manchester' },
  '03301': { state: 'New Hampshire', city: 'Concord' },
  '05401': { state: 'Vermont', city: 'Burlington' },
  '04101': { state: 'Maine', city: 'Portland' },
  '07101': { state: 'New Jersey', city: 'Newark' },
  '07302': { state: 'New Jersey', city: 'Jersey City' },
  '08601': { state: 'New Jersey', city: 'Trenton' },
  '19801': { state: 'Delaware', city: 'Wilmington' },
  '19901': { state: 'Delaware', city: 'Dover' },
  '96801': { state: 'Hawaii', city: 'Honolulu' },
  '96720': { state: 'Hawaii', city: 'Hilo' },
  '99501': { state: 'Alaska', city: 'Anchorage' },
  '99801': { state: 'Alaska', city: 'Juneau' },
  '99701': { state: 'Alaska', city: 'Fairbanks' },
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface DemographicsStepProps {
  defaultValues?: Partial<EnrollmentStep1Values>;
  onNext: (data: EnrollmentStep1Values) => void;
  mode?: 'enroll' | 'edit';
  onCancel?: () => void;
  hideFooter?: boolean;
  formId?: string;
}

const GENDER_OPTIONS = ['Male', 'Female', 'Other'];

// ─── Address Data ─────────────────────────────────────────────────────────────

const COUNTRY_OPTIONS = [
  'United States',
  'Canada',
  'United Kingdom',
  'Australia',
  'India',
  'Germany',
  'France',
  'Spain',
  'Italy',
  'Brazil',
  'Mexico',
  'Japan',
  'South Korea',
  'China',
  'Singapore',
  'United Arab Emirates',
  'Saudi Arabia',
  'South Africa',
  'Nigeria',
  'Philippines',
  'Netherlands',
  'Sweden',
  'Switzerland',
  'New Zealand',
  'Pakistan',
  'Bangladesh',
];

const US_STATES = [
  'Alabama',
  'Alaska',
  'Arizona',
  'Arkansas',
  'California',
  'Colorado',
  'Connecticut',
  'Delaware',
  'District of Columbia',
  'Florida',
  'Georgia',
  'Hawaii',
  'Idaho',
  'Illinois',
  'Indiana',
  'Iowa',
  'Kansas',
  'Kentucky',
  'Louisiana',
  'Maine',
  'Maryland',
  'Massachusetts',
  'Michigan',
  'Minnesota',
  'Mississippi',
  'Missouri',
  'Montana',
  'Nebraska',
  'Nevada',
  'New Hampshire',
  'New Jersey',
  'New Mexico',
  'New York',
  'North Carolina',
  'North Dakota',
  'Ohio',
  'Oklahoma',
  'Oregon',
  'Pennsylvania',
  'Rhode Island',
  'South Carolina',
  'South Dakota',
  'Tennessee',
  'Texas',
  'Utah',
  'Vermont',
  'Virginia',
  'Washington',
  'West Virginia',
  'Wisconsin',
  'Wyoming',
];

const CITIES_BY_STATE: Record<string, string[]> = {
  Alabama: ['Birmingham', 'Montgomery', 'Huntsville', 'Mobile', 'Tuscaloosa'],
  Alaska: ['Anchorage', 'Juneau', 'Fairbanks', 'Sitka', 'Ketchikan'],
  Arizona: ['Phoenix', 'Tucson', 'Mesa', 'Chandler', 'Scottsdale', 'Tempe'],
  Arkansas: ['Little Rock', 'Fort Smith', 'Fayetteville', 'Springdale', 'Jonesboro'],
  California: [
    'Los Angeles',
    'San Francisco',
    'San Diego',
    'San Jose',
    'Sacramento',
    'Fresno',
    'Oakland',
    'Long Beach',
  ],
  Colorado: ['Denver', 'Colorado Springs', 'Aurora', 'Fort Collins', 'Lakewood', 'Boulder'],
  Connecticut: ['Bridgeport', 'New Haven', 'Hartford', 'Stamford', 'Waterbury'],
  Delaware: ['Wilmington', 'Dover', 'Newark', 'Middletown', 'Smyrna'],
  'District of Columbia': ['Washington'],
  Florida: ['Miami', 'Orlando', 'Tampa', 'Jacksonville', 'Fort Lauderdale', 'Tallahassee', 'Naples'],
  Georgia: ['Atlanta', 'Augusta', 'Savannah', 'Athens', 'Columbus', 'Macon'],
  Hawaii: ['Honolulu', 'Hilo', 'Kailua', 'Kapolei', 'Kaneohe'],
  Idaho: ['Boise', 'Meridian', 'Nampa', 'Idaho Falls', 'Pocatello'],
  Illinois: ['Chicago', 'Aurora', 'Naperville', 'Joliet', 'Rockford', 'Springfield'],
  Indiana: ['Indianapolis', 'Fort Wayne', 'Evansville', 'South Bend', 'Carmel'],
  Iowa: ['Des Moines', 'Cedar Rapids', 'Davenport', 'Sioux City', 'Iowa City'],
  Kansas: ['Wichita', 'Overland Park', 'Kansas City', 'Topeka', 'Olathe'],
  Kentucky: ['Louisville', 'Lexington', 'Bowling Green', 'Owensboro', 'Covington'],
  Louisiana: ['New Orleans', 'Baton Rouge', 'Shreveport', 'Lafayette', 'Lake Charles'],
  Maine: ['Portland', 'Lewiston', 'Bangor', 'South Portland', 'Auburn'],
  Maryland: ['Baltimore', 'Frederick', 'Rockville', 'Gaithersburg', 'Annapolis'],
  Massachusetts: ['Boston', 'Worcester', 'Springfield', 'Cambridge', 'Lowell', 'Quincy'],
  Michigan: ['Detroit', 'Grand Rapids', 'Warren', 'Sterling Heights', 'Ann Arbor', 'Lansing'],
  Minnesota: ['Minneapolis', 'Saint Paul', 'Rochester', 'Duluth', 'Bloomington'],
  Mississippi: ['Jackson', 'Gulfport', 'Southaven', 'Hattiesburg', 'Biloxi'],
  Missouri: ['Kansas City', 'Saint Louis', 'Springfield', 'Columbia', 'Independence'],
  Montana: ['Billings', 'Missoula', 'Great Falls', 'Bozeman', 'Butte'],
  Nebraska: ['Omaha', 'Lincoln', 'Bellevue', 'Grand Island', 'Kearney'],
  Nevada: ['Las Vegas', 'Henderson', 'Reno', 'North Las Vegas', 'Sparks'],
  'New Hampshire': ['Manchester', 'Nashua', 'Concord', 'Derry', 'Dover'],
  'New Jersey': ['Newark', 'Jersey City', 'Paterson', 'Elizabeth', 'Trenton', 'Camden'],
  'New Mexico': ['Albuquerque', 'Las Cruces', 'Rio Rancho', 'Santa Fe', 'Roswell'],
  'New York': ['New York City', 'Buffalo', 'Rochester', 'Yonkers', 'Syracuse', 'Albany'],
  'North Carolina': ['Charlotte', 'Raleigh', 'Greensboro', 'Durham', 'Winston-Salem', 'Fayetteville'],
  'North Dakota': ['Fargo', 'Bismarck', 'Grand Forks', 'Minot', 'West Fargo'],
  Ohio: ['Columbus', 'Cleveland', 'Cincinnati', 'Toledo', 'Akron', 'Dayton'],
  Oklahoma: ['Oklahoma City', 'Tulsa', 'Norman', 'Broken Arrow', 'Edmond'],
  Oregon: ['Portland', 'Salem', 'Eugene', 'Gresham', 'Hillsboro', 'Bend'],
  Pennsylvania: ['Philadelphia', 'Pittsburgh', 'Allentown', 'Erie', 'Reading', 'Harrisburg'],
  'Rhode Island': ['Providence', 'Cranston', 'Warwick', 'Pawtucket', 'East Providence'],
  'South Carolina': ['Columbia', 'Charleston', 'North Charleston', 'Greenville', 'Rock Hill'],
  'South Dakota': ['Sioux Falls', 'Rapid City', 'Aberdeen', 'Brookings', 'Watertown'],
  Tennessee: ['Nashville', 'Memphis', 'Knoxville', 'Chattanooga', 'Clarksville'],
  Texas: ['Houston', 'San Antonio', 'Dallas', 'Austin', 'Fort Worth', 'El Paso', 'Arlington'],
  Utah: ['Salt Lake City', 'West Valley City', 'Provo', 'West Jordan', 'Ogden'],
  Vermont: ['Burlington', 'South Burlington', 'Rutland', 'Barre', 'Montpelier'],
  Virginia: ['Virginia Beach', 'Norfolk', 'Chesapeake', 'Richmond', 'Arlington', 'Alexandria'],
  Washington: ['Seattle', 'Spokane', 'Tacoma', 'Vancouver', 'Bellevue', 'Olympia'],
  'West Virginia': ['Charleston', 'Huntington', 'Morgantown', 'Parkersburg', 'Wheeling'],
  Wisconsin: ['Milwaukee', 'Madison', 'Green Bay', 'Kenosha', 'Racine', 'Appleton'],
  Wyoming: ['Cheyenne', 'Casper', 'Laramie', 'Gillette', 'Rock Springs'],
};

// ─── Country → States / Cities ────────────────────────────────────────────────

const STATES_BY_COUNTRY: Record<string, string[]> = {
  'United States': US_STATES,
  Canada: [
    'Alberta',
    'British Columbia',
    'Manitoba',
    'New Brunswick',
    'Newfoundland and Labrador',
    'Nova Scotia',
    'Ontario',
    'Prince Edward Island',
    'Quebec',
    'Saskatchewan',
  ],
  Australia: [
    'New South Wales',
    'Queensland',
    'South Australia',
    'Tasmania',
    'Victoria',
    'Western Australia',
    'Australian Capital Territory',
    'Northern Territory',
  ],
  India: [
    'Andhra Pradesh',
    'Delhi',
    'Gujarat',
    'Karnataka',
    'Kerala',
    'Madhya Pradesh',
    'Maharashtra',
    'Punjab',
    'Rajasthan',
    'Tamil Nadu',
    'Telangana',
    'Uttar Pradesh',
    'West Bengal',
  ],
  'United Kingdom': ['England', 'Northern Ireland', 'Scotland', 'Wales'],
  Germany: [
    'Baden-Württemberg',
    'Bavaria',
    'Berlin',
    'Brandenburg',
    'Bremen',
    'Hamburg',
    'Hesse',
    'Lower Saxony',
    'Mecklenburg-Vorpommern',
    'North Rhine-Westphalia',
    'Rhineland-Palatinate',
    'Saarland',
    'Saxony',
    'Saxony-Anhalt',
    'Schleswig-Holstein',
    'Thuringia',
  ],
};

const CITIES_BY_COUNTRY_STATE: Record<string, Record<string, string[]>> = {
  Canada: {
    Ontario: ['Toronto', 'Ottawa', 'Mississauga', 'Brampton', 'Hamilton'],
    'British Columbia': ['Vancouver', 'Victoria', 'Surrey', 'Burnaby', 'Kelowna'],
    Alberta: ['Calgary', 'Edmonton', 'Red Deer', 'Lethbridge', 'St. Albert'],
    Quebec: ['Montreal', 'Quebec City', 'Laval', 'Gatineau', 'Longueuil'],
    Manitoba: ['Winnipeg', 'Brandon', 'Steinbach', 'Thompson'],
    Saskatchewan: ['Saskatoon', 'Regina', 'Prince Albert', 'Moose Jaw'],
    'Nova Scotia': ['Halifax', 'Cape Breton', 'Truro', 'Dartmouth'],
    'New Brunswick': ['Moncton', 'Saint John', 'Fredericton', 'Miramichi'],
    'Newfoundland and Labrador': ["St. John's", 'Corner Brook', 'Gander'],
    'Prince Edward Island': ['Charlottetown', 'Summerside'],
  },
  Australia: {
    'New South Wales': ['Sydney', 'Newcastle', 'Wollongong', 'Canberra'],
    Victoria: ['Melbourne', 'Geelong', 'Ballarat', 'Bendigo'],
    Queensland: ['Brisbane', 'Gold Coast', 'Sunshine Coast', 'Townsville', 'Cairns'],
    'South Australia': ['Adelaide', 'Mount Gambier', 'Whyalla'],
    'Western Australia': ['Perth', 'Fremantle', 'Bunbury', 'Geraldton'],
    Tasmania: ['Hobart', 'Launceston', 'Devonport'],
    'Australian Capital Territory': ['Canberra'],
    'Northern Territory': ['Darwin', 'Alice Springs'],
  },
  India: {
    Maharashtra: ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad'],
    Delhi: ['New Delhi', 'Noida', 'Gurgaon', 'Faridabad'],
    Karnataka: ['Bengaluru', 'Mysuru', 'Hubli', 'Mangaluru'],
    'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Salem'],
    'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Prayagraj'],
    Gujarat: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot'],
    'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol'],
    Rajasthan: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota'],
    Telangana: ['Hyderabad', 'Warangal', 'Nizamabad'],
    Kerala: ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur'],
    Punjab: ['Chandigarh', 'Ludhiana', 'Amritsar', 'Jalandhar'],
    'Madhya Pradesh': ['Bhopal', 'Indore', 'Gwalior', 'Jabalpur'],
    'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur'],
  },
  'United Kingdom': {
    England: ['London', 'Birmingham', 'Manchester', 'Leeds', 'Liverpool', 'Bristol', 'Sheffield', 'Newcastle'],
    Scotland: ['Edinburgh', 'Glasgow', 'Aberdeen', 'Dundee', 'Inverness'],
    Wales: ['Cardiff', 'Swansea', 'Newport', 'Bangor'],
    'Northern Ireland': ['Belfast', 'Derry', 'Lisburn', 'Newry'],
  },
  Germany: {
    Bavaria: ['Munich', 'Nuremberg', 'Augsburg', 'Regensburg'],
    'North Rhine-Westphalia': ['Cologne', 'Düsseldorf', 'Dortmund', 'Essen', 'Bonn'],
    'Baden-Württemberg': ['Stuttgart', 'Mannheim', 'Karlsruhe', 'Freiburg'],
    Berlin: ['Berlin'],
    Hamburg: ['Hamburg'],
    Hesse: ['Frankfurt', 'Wiesbaden', 'Darmstadt', 'Kassel'],
    'Lower Saxony': ['Hanover', 'Brunswick', 'Osnabrück'],
    Saxony: ['Dresden', 'Leipzig', 'Chemnitz'],
  },
};

// ─── Profile Picture Crop Helpers ────────────────────────────────────────────

function centerSquareCrop(width: number, height: number): Crop {
  return centerCrop(makeAspectCrop({ unit: '%', width: 90 }, 1, width, height), width, height);
}

function getCroppedDataUrl(image: HTMLImageElement, crop: PixelCrop): string {
  const canvas = document.createElement('canvas');
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  canvas.width = crop.width;
  canvas.height = crop.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width,
    crop.height
  );
  return canvas.toDataURL('image/jpeg', 0.92);
}

interface CropModalProps {
  imgSrc: string;
  onApply: (dataUrl: string) => void;
  onClose: () => void;
}

function CropModal({ imgSrc, onApply, onClose }: CropModalProps): React.JSX.Element {
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    setCrop(centerSquareCrop(width, height));
  }

  function handleApply() {
    if (!imgRef.current || !completedCrop || completedCrop.width === 0) return;
    onApply(getCroppedDataUrl(imgRef.current, completedCrop));
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[3px]" onClick={onClose} />
      <div className="relative z-10 w-full max-w-[520px] mx-4 rounded-2xl bg-white shadow-xs overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <p className="text-[15px] font-bold text-foreground">Crop Profile Photo</p>
            <p className="text-[12px] text-muted-foreground mt-0.5">Drag to reposition · resize handles to adjust</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-slate-100 transition-colors"
          >
            <X size={15} />
          </button>
        </div>
        <div className="flex items-center justify-center bg-slate-900 px-6 py-6 min-h-[280px]">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={1}
            circularCrop
            keepSelection
            minWidth={60}
            minHeight={60}
          >
            <img
              ref={imgRef}
              src={imgSrc}
              alt="Crop preview"
              onLoad={onImageLoad}
              className="max-h-[320px] max-w-full object-contain"
              style={{ display: 'block' }}
            />
          </ReactCrop>
        </div>
        <div className="flex items-center gap-2 px-6 py-2.5 bg-slate-50 border-t border-slate-100 border-b">
          <ZoomIn size={12} className="text-muted-foreground" />
          <p className="text-[11.5px] text-muted-foreground">Drag the circle to reposition · drag corners to resize</p>
          <ZoomOut size={12} className="text-muted-foreground ml-auto" />
        </div>
        <div className="flex items-center justify-end gap-2.5 px-6 py-4">
          <Button type="button" variant="outline" className="h-9 px-5 text-[13px]" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            className="h-9 px-5 text-[13px] shadow-xs"
            onClick={handleApply}
            disabled={!completedCrop || completedCrop.width === 0}
          >
            Apply Crop
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Date Picker ──────────────────────────────────────────────────────────────

function DatePicker({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (val: string) => void;
  error?: boolean;
}): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const selected = value ? new Date(value + 'T00:00:00') : undefined;
  const today = new Date();

  useEffect(() => {
    function handler(e: MouseEvent) {
      const target = e.target as Node;
      if (!triggerRef.current?.contains(target) && !calendarRef.current?.contains(target)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  function handleOpen() {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + 4, left: rect.left });
    setOpen((o) => !o);
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleOpen}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-md border bg-background px-3 text-sm transition-colors select-none',
          error ? 'border-destructive' : 'border-input',
          open && 'ring-2 ring-ring ring-offset-1',
          !value && 'text-muted-foreground'
        )}
      >
        <span>{value ? format(new Date(value + 'T00:00:00'), 'MM/dd/yyyy') : 'Select date of birth'}</span>
        <CalendarDays size={14} className="text-muted-foreground shrink-0" />
      </button>
      {open &&
        pos &&
        createPortal(
          <div
            ref={calendarRef}
            style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 9999 }}
            className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden"
          >
            <Calendar
              mode="single"
              selected={selected}
              onSelect={(date) => {
                if (date) {
                  onChange(format(date, 'yyyy-MM-dd'));
                  setOpen(false);
                }
              }}
              disabled={{ after: today }}
              defaultMonth={selected ?? new Date(1990, 0)}
              captionLayout="dropdown"
              startMonth={new Date(1920, 0)}
              endMonth={today}
            />
          </div>,
          document.body
        )}
    </>
  );
}

// ─── Section label ────────────────────────────────────────────────────────────

function SectionLabel({ label }: { label: string }): React.JSX.Element {
  return (
    <div className="flex items-center gap-3 pt-3">
      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.08em] whitespace-nowrap">
        {label}
      </span>
      <div className="flex-1 h-px bg-slate-100" />
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DemographicsStep({
  defaultValues,
  onNext,
  mode = 'enroll',
  onCancel,
  hideFooter = false,
  formId,
}: DemographicsStepProps): React.JSX.Element {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarSrc, setAvatarSrc] = useState<string>(defaultValues?.profilePicture ?? '');
  const [cropImgSrc, setCropImgSrc] = useState<string | null>(null);

  const form = useForm<EnrollmentStep1Values>({
    resolver: zodResolver(schema) as Resolver<EnrollmentStep1Values>,
    defaultValues: {
      firstName: '',
      lastName: '',
      mrn: '',
      dateOfBirth: '',
      gender: '',
      email: '',
      phone: '',
      profilePicture: '',
      zipCode: '',
      country: '',
      state: '',
      city: '',
      addressLine1: '',
      addressLine2: '',
      ...defaultValues,
    },
  });

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') setCropImgSrc(reader.result);
    };
    reader.readAsDataURL(file);
  }, []);

  function handleCropApply(dataUrl: string) {
    setAvatarSrc(dataUrl);
    form.setValue('profilePicture', dataUrl);
    setCropImgSrc(null);
  }

  function handleRemoveAvatar() {
    setAvatarSrc('');
    form.setValue('profilePicture', '');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  const zipValue = useWatch({ control: form.control, name: 'zipCode' });
  const watchedCountry = useWatch({ control: form.control, name: 'country' });
  const watchedState = useWatch({ control: form.control, name: 'state' });
  const { setValue } = form;

  // Auto-fill state + city from ZIP code (USA only)
  useEffect(() => {
    if (watchedCountry !== 'United States') return;
    const zip = (zipValue ?? '').trim();
    if (zip.length !== 5 || !/^\d{5}$/.test(zip)) return;
    const loc = ZIP_TO_LOCATION[zip];
    if (loc) {
      setValue('state', loc.state, { shouldValidate: false });
      setValue('city', loc.city, { shouldValidate: false });
    }
  }, [zipValue, watchedCountry, setValue]);

  return (
    <>
      {cropImgSrc &&
        createPortal(
          <CropModal imgSrc={cropImgSrc} onApply={handleCropApply} onClose={() => setCropImgSrc(null)} />,
          document.body
        )}

      <Form {...form}>
        <form id={formId} onSubmit={form.handleSubmit(onNext)} className="space-y-5">
          <SectionLabel label="Personal Information" />

          {/* Profile Picture */}
          <div className="space-y-2">
            <Label className="text-[12.5px] font-medium">
              Profile Picture
              <span className="ml-1.5 text-[11px] font-normal text-muted-foreground">(optional)</span>
            </Label>
            <div className="flex items-center gap-5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  'w-[64px] h-[64px] rounded-full overflow-hidden border-2 border-dashed border-border bg-muted flex items-center justify-center transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0',
                  avatarSrc && 'border-solid border-primary'
                )}
                aria-label="Upload profile picture"
              >
                {avatarSrc ? (
                  <img src={avatarSrc} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User size={24} className="text-muted-foreground" />
                )}
              </button>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5 h-8 text-[12.5px]"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={12} />
                    {avatarSrc ? 'Change Photo' : 'Upload Photo'}
                  </Button>
                  {avatarSrc && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 h-8 text-[12.5px] text-muted-foreground hover:text-destructive hover:bg-destructive/8"
                      onClick={handleRemoveAvatar}
                    >
                      <X size={12} />
                      Remove
                    </Button>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">JPG or PNG · max 2 MB · crop after selecting</p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* MRN */}
          <FormField
            control={form.control}
            name="mrn"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-[12.5px] font-medium">
                  MRN Number <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="e.g. MRN-10042" className="h-10 text-sm" {...field} />
                </FormControl>
                <FormMessage className="text-[11px]" />
              </FormItem>
            )}
          />

          {/* First + Last */}
          <div className="grid grid-cols-2 gap-5">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-[12.5px] font-medium">
                    First Name <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Emma" className="h-10 text-sm" {...field} />
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-[12.5px] font-medium">
                    Last Name <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Rodriguez" className="h-10 text-sm" {...field} />
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />
          </div>

          {/* DOB + Gender */}
          <div className="grid grid-cols-2 gap-5">
            <Controller
              control={form.control}
              name="dateOfBirth"
              render={({ field, fieldState }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-[12.5px] font-medium">
                    Date of Birth <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <DatePicker value={field.value} onChange={field.onChange} error={!!fieldState.error} />
                  </FormControl>
                  {fieldState.error && <p className="text-[11px] text-destructive">{fieldState.error.message}</p>}
                </FormItem>
              )}
            />
            <Controller
              control={form.control}
              name="gender"
              render={({ field, fieldState }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-[12.5px] font-medium">
                    Gender <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <PortalSelect
                      value={field.value}
                      onChange={field.onChange}
                      options={GENDER_OPTIONS}
                      placeholder="Select gender"
                      error={!!fieldState.error}
                    />
                  </FormControl>
                  {fieldState.error && <p className="text-[11px] text-destructive">{fieldState.error.message}</p>}
                </FormItem>
              )}
            />
          </div>

          {/* Email + Phone */}
          <div className="grid grid-cols-2 gap-5">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-[12.5px] font-medium">
                    Email Address <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="e.g. emma@email.com" className="h-10 text-sm" {...field} />
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-[12.5px] font-medium">
                    Phone Number <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="flex h-10 rounded-lg border border-input bg-background overflow-hidden transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
                      <div className="flex items-center gap-1.5 px-3 bg-muted border-r border-border text-sm text-foreground font-medium select-none shrink-0">
                        🇺🇸 <span className="text-muted-foreground">+1</span>
                      </div>
                      <input
                        type="tel"
                        placeholder="(555) 000-0000"
                        autoComplete="tel"
                        data-phi="true"
                        className="flex-1 px-3 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
                        value={field.value}
                        onChange={(e) => field.onChange(formatPhoneNumber(e.target.value))}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />
          </div>

          <SectionLabel label="Address" />

          {/* ZIP + Country */}
          <div className="grid grid-cols-2 gap-5">
            <FormField
              control={form.control}
              name="zipCode"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-[12.5px] font-medium">
                    ZIP Code <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 60601" className="h-10 text-sm" {...field} />
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />
            <Controller
              control={form.control}
              name="country"
              render={({ field, fieldState }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-[12.5px] font-medium">
                    Country <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <PortalSelect
                      value={field.value}
                      onChange={(val) => {
                        field.onChange(val);
                        form.setValue('state', '', { shouldValidate: false });
                        form.setValue('city', '', { shouldValidate: false });
                      }}
                      options={COUNTRY_OPTIONS}
                      placeholder="Select country"
                      error={!!fieldState.error}
                    />
                  </FormControl>
                  {fieldState.error && <p className="text-[11px] text-destructive">{fieldState.error.message}</p>}
                </FormItem>
              )}
            />
          </div>

          {/* State + City */}
          {(() => {
            const stateOptions = STATES_BY_COUNTRY[watchedCountry] ?? [];
            const hasStateDropdown = stateOptions.length > 0;
            const usaCityOptions = watchedCountry === 'United States' ? (CITIES_BY_STATE[watchedState] ?? []) : [];
            const intlCityOptions =
              watchedCountry !== 'United States' && watchedState
                ? (CITIES_BY_COUNTRY_STATE[watchedCountry]?.[watchedState] ?? [])
                : [];
            const cityOptions = watchedCountry === 'United States' ? usaCityOptions : intlCityOptions;
            const hasCityDropdown = cityOptions.length > 0;

            return (
              <div className="grid grid-cols-2 gap-5">
                <Controller
                  control={form.control}
                  name="state"
                  render={({ field, fieldState }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-[12.5px] font-medium">
                        State <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        {hasStateDropdown ? (
                          <PortalSelect
                            value={field.value}
                            onChange={(val) => {
                              field.onChange(val);
                              form.setValue('city', '', { shouldValidate: false });
                            }}
                            options={stateOptions}
                            placeholder="Select state"
                            error={!!fieldState.error}
                          />
                        ) : (
                          <Input placeholder="e.g. State / Province" className="h-10 text-sm" {...field} />
                        )}
                      </FormControl>
                      {fieldState.error && <p className="text-[11px] text-destructive">{fieldState.error.message}</p>}
                    </FormItem>
                  )}
                />
                <Controller
                  control={form.control}
                  name="city"
                  render={({ field, fieldState }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-[12.5px] font-medium">
                        City <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        {hasCityDropdown ? (
                          <PortalSelect
                            value={field.value}
                            onChange={field.onChange}
                            options={cityOptions}
                            placeholder="Select city"
                            error={!!fieldState.error}
                          />
                        ) : (
                          <Input
                            placeholder={watchedState ? 'e.g. City' : 'Select a state first'}
                            className="h-10 text-sm"
                            disabled={hasStateDropdown && !watchedState}
                            {...field}
                          />
                        )}
                      </FormControl>
                      {fieldState.error && <p className="text-[11px] text-destructive">{fieldState.error.message}</p>}
                    </FormItem>
                  )}
                />
              </div>
            );
          })()}

          {/* Address Line 1 */}
          <FormField
            control={form.control}
            name="addressLine1"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-[12.5px] font-medium">
                  Address Line 1 <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Street address, building, suite" className="h-10 text-sm" {...field} />
                </FormControl>
                <FormMessage className="text-[11px]" />
              </FormItem>
            )}
          />

          {/* Address Line 2 */}
          <FormField
            control={form.control}
            name="addressLine2"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-[12.5px] font-medium">
                  Address Line 2<span className="ml-1.5 text-[11px] font-normal text-muted-foreground">(optional)</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Apt, floor, unit, etc." className="h-10 text-sm" {...field} />
                </FormControl>
                <FormMessage className="text-[11px]" />
              </FormItem>
            )}
          />

          {!hideFooter &&
            (mode === 'edit' ? (
              <div className="sticky bottom-0 -mx-8 px-8 py-4 bg-white border-t border-slate-100 flex justify-between mt-6">
                <Button type="button" variant="outline" className="px-7 h-10" onClick={onCancel}>
                  Cancel
                </Button>
                <Button type="submit" className="px-7 h-10 shadow-xs">
                  Save Changes
                </Button>
              </div>
            ) : (
              <div className="sticky bottom-0 -mx-8 px-8 py-4 bg-white border-t border-slate-100 flex justify-end mt-6">
                <Button type="submit" className="px-8 h-10 gap-2 shadow-xs">
                  Next
                </Button>
              </div>
            ))}
        </form>
      </Form>
    </>
  );
}
