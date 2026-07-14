// journalMedia.js — Foto-/Medien-Anhänge für Journal-Einträge (DayOne-Muster).
//
// Bewusst NICHT über @db: die saveJournal-Implementierungen der Kontexte
// (fitness local / fitness firestore / journal standalone) kennen keine
// attachments. Dieses Modul spricht Firestore + Storage direkt über die
// journal-eigene guarded Firebase-Init an (../../lib/firebase.js ist eine
// echte Datei, kein Symlink — die vitalos/fuel-Redirect-Plugins leiten sie
// im jeweiligen Host-Build auf dessen Firebase-Init um).
//
// Storage-Layout:   journal/{uid}/{date}/{ts}_{sanitizedName}
// Firestore-Feld:   fitness/{uid}/journal/{entryId}.attachments
//                   = [{ url, path, type }]

import { db, auth } from "../../lib/firebase.js";
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import {
  getStorage, ref as storageRef,
  uploadBytes, getDownloadURL, deleteObject,
} from "firebase/storage";

async function uid() {
  await auth?.authStateReady?.();
  const u = auth?.currentUser?.uid;
  if (!u) throw new Error("not authenticated");
  return u;
}

function entryDoc(userId, entryId) {
  return doc(db, "fitness", userId, "journal", entryId);
}

// Medien-Features gibt es nur mit Firebase-Auth-User. fitness/journal haben
// auch einen local-Modus ohne Auth — dort bleibt die Medien-UI versteckt.
export async function mediaAvailable() {
  try {
    await auth?.authStateReady?.();
    return !!auth?.currentUser?.uid;
  } catch {
    return false;
  }
}

function sanitizeName(name) {
  return String(name || "bild")
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .slice(-80);
}

// Lädt eine Datei in den Storage und liefert die Attachment-Referenz,
// wie sie am Journal-Doc gespeichert wird.
export async function uploadJournalMedia(file, date) {
  const userId = await uid();
  const path = `journal/${userId}/${date}/${Date.now()}_${sanitizeName(file.name)}`;
  const ref = storageRef(getStorage(), path);
  await uploadBytes(ref, file, file.type ? { contentType: file.type } : undefined);
  const url = await getDownloadURL(ref);
  return { url, path, type: file.type || "" };
}

// Hängt hochgeladene Attachments an einen bestehenden Journal-Eintrag an.
export async function attachToEntry(entryId, attachments) {
  if (!entryId || !attachments?.length) return;
  const userId = await uid();
  await updateDoc(entryDoc(userId, entryId), {
    attachments: arrayUnion(...attachments),
  });
}

// Entfernt ein Attachment: Storage-Objekt löschen (Fehler tolerieren —
// die Firestore-Referenz soll auch bei verwaistem Objekt verschwinden),
// dann arrayRemove auf dem Journal-Doc.
export async function removeAttachment(entryId, attachment) {
  if (!entryId || !attachment) return;
  const userId = await uid();
  if (attachment.path) {
    try {
      await deleteObject(storageRef(getStorage(), attachment.path));
    } catch {
      // Objekt fehlt bereits / kein Zugriff — Referenz trotzdem lösen.
    }
  }
  await updateDoc(entryDoc(userId, entryId), {
    attachments: arrayRemove(attachment),
  });
}
