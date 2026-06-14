CREATE POLICY "payment_screenshots_owner_rw"
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'payment-screenshots' AND (auth.uid()::text = (storage.foldername(name))[1] OR is_admin()))
WITH CHECK (bucket_id = 'payment-screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);